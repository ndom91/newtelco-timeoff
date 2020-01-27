import React from 'react'
import Layout from '../components/layout/index'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import Moment from 'moment-timezone'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
import Subheader from '../components/content-subheader'
import DateTimeField from '../components/aggrid/datetime'
import DateField from '../components/aggrid/date'
import ApprovedField from '../components/aggrid/approved'
import TypeField from '../components/aggrid/type'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import { extendMoment } from 'moment-range'
import {
  Container,
  Header,
  Content,
  Button,
  ButtonToolbar,
  IconButton,
  ButtonGroup,
  Panel,
  Icon,
  Modal,
  Table,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Notification
} from 'rsuite'

const { Column, HeaderCell, Cell } = Table

const moment = extendMoment(Moment)

class Wrapper extends React.Component {
  static async getInitialProps ({ res, req, query }) {
    if (req && !req.user) {
      if (res) {
        res.writeHead(302, {
          Location: '/auth'
        })
        res.end()
      } else {
        Router.push('/auth')
      }
    }
    return {
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)
    const thisYear = new Date().getFullYear()

    this.state = {
      rowData: [],
      openConfirmDeleteModal: false,
      openEditModal: false,
      gridOptions: {
        defaultColDef: {
          resizable: true,
          sortable: true,
          filter: true,
          selectable: false,
          editable: false
        },
        columnDefs: [
          {
            headerName: 'ID',
            field: 'id',
            hide: true,
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'Submitted',
            cellRenderer: 'dateTimeShort',
            field: 'submitted_datetime',
            width: 160
          }, {
            headerName: 'Type',
            field: 'type',
            width: 100
          }, {
            headerName: 'From',
            field: 'fromDate',
            tooltipField: 'fromDate',
            cellRenderer: 'dateShort',
            width: 100
          }, {
            headerName: 'To',
            field: 'toDate',
            tooltipField: 'toDate',
            cellRenderer: 'dateShort',
            width: 100
          }, {
            headerName: 'Days from Last Year',
            field: 'resturlaubVorjahr',
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            },
            width: 180
          }, {
            headerName: 'Days Earned this Year',
            field: 'jahresurlaubInsgesamt',
            tooltipField: 'jahresurlaubInsgesamt',
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }, {
            headerName: 'Total Days Available',
            field: 'restjahresurlaubInsgesamt',
            width: 160,
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }, {
            headerName: 'Requested Days',
            field: 'beantragt',
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            },
            width: 160
          }, {
            headerName: `Days Remaining ${thisYear}`,
            field: 'resturlaubJAHR',
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            },
            width: 180
          }, {
            headerName: 'Approval Date/Time',
            field: 'approval_datetime',
            cellRenderer: 'dateTimeShort',
            width: 160
          }, {
            headerName: 'Approved',
            field: 'approved',
            width: 120,
            cellRenderer: 'approved',
            pinned: 'right',
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }
        ],
        context: { componentParent: this },
        frameworkComponents: {
          dateTimeShort: DateTimeField,
          dateShort: DateField,
          approved: ApprovedField,
          type: TypeField
        },
        rowSelection: 'multiple',
        paginationPageSize: 10,
        rowClass: 'row-class',
        rowClassRules: {
          'row-awaitingResponse': function (params) {
            const approved = params.data.approved
            if (approved !== '2') {
              return true
            }
            return false
          }
        }
      }
    }
  }

  notifyInfo = (header, text) => {
    Notification.info({
      title: header,
      duration: 2000,
      description: <div className='notify-body'>{text}</div>
    })
  }

  notifyWarn = (header, text) => {
    Notification.warning({
      title: header,
      duration: 2000,
      description: <div className='notify-body'>{text}</div>
    })
  }

  componentDidMount () {
    const host = window.location.host
    const protocol = window.location.protocol
    const user = this.props.session.user.email
    fetch(`${protocol}//${host}/api/user/entries?user=${user}`)
      .then(res => res.json())
      .then(data => {
        if (data.userEntries) {
          const heatmap = []
          this.setState({
            rowData: data.userEntries
          })
          data.userEntries.forEach(entry => {
            const from = moment(entry.from)
            const to = moment(entry.to)
            const range = moment.range(from, to)
            for (const day of range.by('day')) {
              heatmap.push({ date: day, value: 1 })
            }
            // https://www.npmjs.com/package/reactjs-calendar-heatmap
          })
          this.setState({
            heatmapData: heatmap
          })
          window.gridApi && window.gridApi.refreshCells()
        }
      })
      .catch(err => console.error(err))
  }

  handleGridReady = params => {
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
  }

  onFirstDataRendered = params => {
    params.columnApi.autoSizeColumns()
  }

  handleGridExport = () => {
    if (this.gridApi) {
      const email = this.props.session.user.email
      const username = email.substr(0, email.lastIndexOf('@'))
      const params = {
        allColumns: true,
        fileName: `${username}_timeoff_${moment(new Date()).format('YYYYMMDD')}.csv`,
        columnSeparator: ','
      }
      this.gridApi.exportDataAsCsv(params)
    }
  }

  toggleConfirmDeleteModal = () => {
    if (this.gridApi) {
      const selectedRow = this.gridApi.getSelectedRows()
      const request = selectedRow[0]
      const tableData = [
        {
          title: 'From',
          value: moment(request.fromDate).format('DD.MM.YYYY')
        },
        {
          title: 'To',
          value: moment(request.toDate).format('DD.MM.YYYY')
        },
        {
          title: 'Manager',
          value: request.manager
        },
        {
          title: 'Type',
          value: request.type.charAt(0).toUpperCase() + request.type.slice(1)
        },
        {
          title: 'Requested Days',
          value: request.beantragt
        },
        {
          title: 'Remaining Days',
          value: request.resturlaubJAHR
        }
      ]
      this.setState({
        openConfirmDeleteModal: !this.state.openConfirmDeleteModal,
        confirmDeleteData: tableData,
        toDelete: request.id || 0
      })
    }
  }

  handleSubmitDelete = () => {
    const deleteId = this.state.toDelete
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/user/entries/delete?id=${deleteId}`)
      .then(res => res.json())
      .then(data => {
        if (data.deleteQuery.affectedRows > 0) {
          this.notifyInfo('Request Deleted')
        } else {
          this.notifyWarn('Error Deleting Request')
        }
        const newRowData = this.state.rowData.filter(row => row.id !== deleteId)
        this.setState({
          rowData: newRowData,
          openConfirmDeleteModal: !this.state.openConfirmDeleteModal
        })
        this.gridApi.refreshCells()
      })
      .catch(err => console.error(err))
  }

  toggleEditModal = () => {
    if (this.gridApi) {
      const selectedRow = this.gridApi.getSelectedRows()
      const request = selectedRow[0]
      const tableData = {
        from: moment(request.fromDate).format('MM/DD/YYYY'),
        to: moment(request.toDate).format('MM/DD/YYYY'),
        lastYear: request.resturlaubVorjahr,
        thisYear: request.jahresurlaubInsgesamt,
        total: request.restjahresurlaubInsgesamt,
        requested: request.beantragt,
        remaining: request.resturlaubJAHR,
        id: request.id
      }
      this.setState({
        openEditModal: !this.state.openEditModal,
        editData: tableData
      })
    }
  }

  render () {
    const {
      gridOptions,
      rowData,
      openConfirmDeleteModal,
      confirmDeleteData,
      openEditModal,
      editData
    } = this.state

    if (this.props.session.user) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <Container>
            <Subheader header='User' subheader='Dashboard' />
            <Panel bordered>
              <Header className='user-content-header'>
                <span className='section-header'>
                  My Vacations
                </span>
                <span>
                  <ButtonToolbar>
                    <ButtonGroup>
                      <IconButton icon={<Icon icon='edit' />} appearance='primary' onClick={this.toggleEditModal}>
                        Edit
                      </IconButton>
                      <IconButton icon={<Icon icon='trash' />} appearance='ghost' onClick={this.toggleConfirmDeleteModal}>
                        Delete
                      </IconButton>
                      <IconButton icon={<Icon icon='export' />} appearance='ghost' onClick={this.handleGridExport}>
                        Export
                      </IconButton>
                    </ButtonGroup>
                  </ButtonToolbar>
                </span>
              </Header>
              <Content className='user-grid-wrapper'>
                <div className='ag-theme-material user-grid'>
                  <AgGridReact
                    gridOptions={gridOptions}
                    rowData={rowData}
                    onGridReady={this.handleGridReady}
                    animateRows
                    pagination
                    onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                  />
                </div>
              </Content>
            </Panel>
            {/* <Panel bordered>
              <CalendarHeatmap
                user={this.props.session.user.email}
              />
            </Panel> */}
            {openConfirmDeleteModal && (
              <Modal enforceFocus size='sm' backdrop show={openConfirmDeleteModal} onHide={this.toggleConfirmDeleteModal} style={{ marginTop: '150px' }}>
                <Modal.Header>
                  <Modal.Title style={{ textAlign: 'center', fontSize: '24px' }}>Confirm Submit</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <span style={{ textAlign: 'center', display: 'block', fontWeight: '600' }}>Are you sure you want to delete this request?</span>
                  <Table showHeader={false} autoHeight bordered={false} data={confirmDeleteData} style={{ margin: '20px 50px' }}>
                    <Column width={200} align='left'>
                      <HeaderCell>Field: </HeaderCell>
                      <Cell dataKey='title' />
                    </Column>
                    <Column width={250} align='left'>
                      <HeaderCell>Value: </HeaderCell>
                      <Cell dataKey='value' />
                    </Column>
                  </Table>
                </Modal.Body>
                <Modal.Footer style={{ display: 'flex', justifyContent: 'center' }}>
                  <ButtonToolbar style={{ width: '100%' }}>
                    <ButtonGroup style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <Button onClick={this.handleSubmitDelete} style={{ width: '33%', fontSize: '16px' }} appearance='primary'>
                        Confirm
                      </Button>
                      <Button onClick={this.toggleConfirmDeleteModal} style={{ width: '33%', fontSize: '16px' }} appearance='default'>
                        Cancel
                      </Button>
                    </ButtonGroup>
                  </ButtonToolbar>
                </Modal.Footer>
              </Modal>
            )}
            {openEditModal && (
              <Modal enforceFocus size='sm' backdrop show={openEditModal} onHide={this.toggleEditModal} style={{ marginTop: '150px' }}>
                <Modal.Header>
                  <Modal.Title style={{ textAlign: 'center', fontSize: '24px' }}>Edit Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form layout='horizontal'>
                    <FormGroup>
                      <ControlLabel>Days from Last Year</ControlLabel>
                      <FormControl name='daysLastYear' inputMode='numeric' disabled onChange={this.handleLastYearChange} value={editData.lastYear} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Days from this Year</ControlLabel>
                      <FormControl name='daysThisYear' inputMode='numeric' disabled onChange={this.handleThisYearChange} value={editData.thisYear} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Total Days Available</ControlLabel>
                      <FormControl name='totalDaysAvailable' inputMode='numeric' disabled onChange={this.handleTotalAvailableChange} value={editData.total} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Requested Days</ControlLabel>
                      <FormControl name='requestedDays' inputMode='numeric' disabled onChange={this.handleRequestedChange} value={editData.requested} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Days Remaining this Year</ControlLabel>
                      <FormControl name='remainingDays' inputMode='numeric' disabled onChange={this.handleRemainingChange} value={editData.remaining} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>From</ControlLabel>
                      <FormControl name='from' type='date' onChange={this.handleFromDateChange} value={editData.from} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>To</ControlLabel>
                      <FormControl name='to' type='date' onChange={this.handleToDateChange} value={editData.to} />
                    </FormGroup>
                  </Form>
                </Modal.Body>
                <Modal.Footer style={{ display: 'flex', justifyContent: 'center' }}>
                  <ButtonToolbar style={{ width: '100%' }}>
                    <ButtonGroup style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <Button onClick={this.handleSubmitEdit} style={{ width: '33%', fontSize: '16px' }} appearance='primary'>
                  Confirm
                      </Button>
                      <Button onClick={this.toggleEditModal} style={{ width: '33%', fontSize: '16px' }} appearance='default'>
                  Cancel
                      </Button>
                    </ButtonGroup>
                  </ButtonToolbar>
                </Modal.Footer>
              </Modal>
            )}
          </Container>
          <style jsx>{`
            :global(.user-content-header) {
              display: flex;
              width: 100%;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            :global(.user-grid-wrapper) {
              height: 100%;
            }
            :global(.user-grid) {
              height: 100%;
            }
            :global(.row-awaitingResponse) {
              background-color: transparent;
            }
            :global(.rs-container, .rs-panel-default, .rs-panel-body) {
              height: 100%;
            }
            :global(.section-header) {
              font-size: 1.3rem;
            }
            :global(.ag-cell-label-container) {
              width: 110%;
            }
            :global(div.ag-cell.ag-cell-first-right-pinned > div.ag-react-container) {
              margin-top: 15px;
            }
          `}
          </style>
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}

export default Wrapper
