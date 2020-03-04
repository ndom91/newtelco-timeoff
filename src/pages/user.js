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
import Uppercase from '../components/aggrid/uppercase'
import ApprovedField from '../components/aggrid/approved'
import ViewFiles from '../components/aggrid/viewfiles'
import TypeField from '../components/aggrid/type'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import { extendMoment } from 'moment-range'
import EditModal from '../components/editRequestModal'
import DeleteModal from '../components/deleteRequestModal'
import {
  Container,
  Header,
  Content,
  ButtonToolbar,
  IconButton,
  ButtonGroup,
  Panel,
  Icon,
  Alert,
  Modal,
  Notification,
  SelectPicker
} from 'rsuite'

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
      files: [],
      uploadedFiles: [],
      loadingFiles: false,
      openConfirmDeleteModal: false,
      gridType: 'vacation',
      openEditModal: false,
      editAvailable: false,
      viewFilesModal: false,
      editData: {
        from: '',
        to: '',
        lastYear: '',
        thisYear: '',
        spent: '',
        total: '',
        requested: '',
        remaining: '',
        id: '',
        note: '',
        approved: '',
        type: ''
      },
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
            cellRenderer: 'uppercase',
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
            headerName: 'Days spent this Year',
            field: 'jahresUrlaubAusgegeben',
            tooltipField: 'jahresUrlaubAusgegeben',
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
            headerName: 'Notes',
            field: 'note',
            width: 160
          }, {
            headerName: 'Manager',
            field: 'manager',
            width: 160
          }, {
            headerName: 'Approval Date/Time',
            field: 'approval_datetime',
            cellRenderer: 'dateTimeShort',
            width: 160
          }, {
            headerName: 'Submitted By',
            field: 'submitted_by',
            width: 140
          }, {
            headerName: 'View Files',
            width: 160,
            cellRenderer: 'viewfiles',
            cellRendererParams: {
              viewFiles: this.toggleViewFilesModal
            },
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              border: 'none'
            }
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
          uppercase: Uppercase,
          type: TypeField,
          viewfiles: ViewFiles
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
    fetch(`${protocol}//${host}/api/user/entries?user=${user}&t=vacation`)
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

  componentDidUpdate = () => {
    const type = this.state.gridType
    if (this.gridColumnApi) {
      const sickHideColumns = [
        'resturlaubVorjahr',
        'jahresurlaubInsgesamt',
        'jahresUrlaubAusgegeben',
        'restjahresurlaubInsgesamt',
        'beantragt',
        'resturlaubJAHR',
        'approved',
        'approval_datetime'
      ]
      if (type === 'sick') {
        sickHideColumns.forEach(column => {
          this.gridColumnApi.setColumnVisible(column, false)
        })
      } else {
        sickHideColumns.forEach(column => {
          this.gridColumnApi.setColumnVisible(column, true)
        })
      }
    }
  }

  setEditData = (files, data) => {
    if (!data) {
      this.setState({
        files: files
      })
    } else {
      this.setState({
        editData: data,
        files: files
      })
    }
  }

  setRowData = (data) => {
    this.setState({
      rowData: data
    })
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

  handleTypeChange = (selection) => {
    const host = window.location.host
    const protocol = window.location.protocol
    const user = this.props.session.user.email
    const type = selection
    fetch(`${protocol}//${host}/api/user/entries?user=${user}&t=${type}`)
      .then(res => res.json())
      .then(data => {
        if (data.userEntries) {
          this.setState({
            rowData: data.userEntries,
            gridType: type
          })
          window.gridApi && window.gridApi.refreshCells()
        }
      })
      .catch(err => console.error(err))
  }

  toggleConfirmDeleteModal = () => {
    if (this.gridApi) {
      const selectedRow = this.gridApi.getSelectedRows()
      if (!selectedRow[0]) {
        this.notifyInfo('Please select an entry to delete!')
        return
      }
      const request = selectedRow[0]
      const tableData = [
        {
          title: 'From',
          value: request.fromDate
        },
        {
          title: 'To',
          value: request.toDate
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

  // handleSubmitDelete = () => {
  //   const deleteId = this.state.toDelete
  //   const host = window.location.host
  //   const protocol = window.location.protocol
  //   fetch(`${protocol}//${host}/api/user/entries/delete?id=${deleteId}`)
  //     .then(res => res.json())
  //     .then(data => {
  //       if (data.deleteQuery.affectedRows > 0) {
  //         this.notifyInfo('Request Deleted')
  //       } else {
  //         this.notifyWarn('Error Deleting Request')
  //       }
  //       const newRowData = this.state.rowData.filter(row => row.id !== deleteId)
  //       this.setState({
  //         rowData: newRowData,
  //         openConfirmDeleteModal: !this.state.openConfirmDeleteModal
  //       })
  //       this.gridApi.refreshCells()
  //     })
  //     .catch(err => console.error(err))
  // }

  toggleEditModal = () => {
    if (this.gridApi) {
      const host = window.location.host
      const protocol = window.location.protocol
      const selectedRow = this.gridApi.getSelectedRows()
      if (!selectedRow[0]) {
        this.notifyInfo('Please select a row to edit')
        return
      }
      const request = selectedRow[0]
      this.setState({
        loadingFiles: true,
        editAvailable: !request.approved == 0
      })
      const rawFrom = request.fromDate.split('.')
      const rawTo = request.toDate.split('.')
      const tableData = {
        from: `${rawFrom[2]}-${rawFrom[1]}-${rawFrom[0]}`,
        to: `${rawTo[2]}-${rawTo[1]}-${rawTo[0]}`,
        lastYear: request.resturlaubVorjahr,
        thisYear: request.jahresurlaubInsgesamt,
        spent: request.jahresUrlaubAusgegeben,
        total: request.restjahresurlaubInsgesamt,
        requested: request.beantragt,
        remaining: request.resturlaubJAHR,
        id: request.id,
        note: request.note,
        approved: request.approved,
        type: request.type && request.type[0].toUpperCase() + request.type.substring(1)
      }
      fetch(`${protocol}//${host}/api/mail/file?id=${request.id}`)
        .then(data => data.json())
        .then(data => {
          let files = []
          if (data.files[0].files.length !== 0) {
            files = JSON.parse(data.files[0].files)
          }
          this.setState({
            editData: tableData,
            files: files,
            loadingFiles: false,
            openEditModal: !this.state.openEditModal
          })
        })
        .catch(err => console.error(err))
    }
  }

  toggleViewFilesModal = (files) => {
    this.setState({
      viewFilesModal: !this.state.viewFilesModal,
      viewFiles: files
    })
  }

  render () {
    const {
      gridOptions,
      rowData,
      openConfirmDeleteModal,
      confirmDeleteData,
      openEditModal,
      editData,
      viewFilesModal,
      viewFiles
    } = this.state

    if (this.props.session.user) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <Container>
            <Subheader header='User' subheader='Dashboard' />
            <Panel bordered>
              <Header className='user-content-header'>
                <div className='section-header'>
                  My Vacations
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <SelectPicker
                    defaultValue='vacation'
                    onChange={this.handleTypeChange}
                    data={[
                      { label: 'Vacation', value: 'vacation' },
                      { label: 'Sick', value: 'sick' },
                      { label: 'Trip', value: 'trip' },
                      { label: 'Moving', value: 'moving' },
                      { label: 'Other', value: 'other' }
                    ]}
                    placeholder='Please Select a Type'
                    style={{ width: '200px', marginRight: '20px' }}
                  />
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
                </div>
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
            {openConfirmDeleteModal && (
              <DeleteModal
                open={openConfirmDeleteModal}
                toggleDeleteModal={this.toggleConfirmDeleteModal}
                data={confirmDeleteData}
                toDelete={this.state.toDelete}
                gridApi={this.gridApi}
                setRowData={this.setRowData}
                rowData={this.state.rowData}
              />
              // <Modal enforceFocus size='sm' backdrop show={openConfirmDeleteModal} onHide={this.toggleConfirmDeleteModal} style={{ marginTop: '150px' }}>
              //   <Modal.Header>
              //     <Modal.Title style={{ textAlign: 'center', fontSize: '24px' }}>Confirm Submit</Modal.Title>
              //   </Modal.Header>
              //   <Modal.Body>
              //     <span style={{ textAlign: 'center', display: 'block', fontWeight: '600' }}>Are you sure you want to delete this request?</span>
              //     <Table showHeader={false} autoHeight bordered={false} data={confirmDeleteData} style={{ margin: '20px 50px' }}>
              //       <Column width={200} align='left'>
              //         <HeaderCell>Field: </HeaderCell>
              //         <Cell dataKey='title' />
              //       </Column>
              //       <Column width={250} align='left'>
              //         <HeaderCell>Value: </HeaderCell>
              //         <Cell dataKey='value' />
              //       </Column>
              //     </Table>
              //   </Modal.Body>
              //   <Modal.Footer style={{ display: 'flex', justifyContent: 'center' }}>
              //     <ButtonToolbar style={{ width: '100%' }}>
              //       <ButtonGroup style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              //         <Button onClick={this.toggleConfirmDeleteModal} style={{ width: '33%', fontSize: '16px' }} appearance='default'>
              //           Cancel
              //         </Button>
              //         <Button onClick={this.handleSubmitDelete} style={{ width: '33%', fontSize: '16px' }} appearance='primary'>
              //           Confirm
              //         </Button>
              //       </ButtonGroup>
              //     </ButtonToolbar>
              //   </Modal.Footer>
              // </Modal>
            )}
            {openEditModal && (
              <EditModal
                open={openEditModal}
                data={editData}
                rowData={this.state.rowData}
                gridApi={this.gridApi}
                setEditData={this.setEditData}
                toggleEditModal={this.toggleEditModal}
                session={this.props.session}
                setRowData={this.setRowData}
              />
            )}
            {viewFilesModal && (
              <Modal
                show={viewFilesModal}
                onHide={this.toggleViewFilesModal}
                style={{
                  width: '350px'
                }}
              >
                <Modal.Header>
                  <Modal.Title>View Files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <ul className='view-file-list'>
                    {viewFiles && viewFiles.map((file, index) => {
                      return (
                        <li className='view-file-list-item' key={index}>
                          <div className='view-file-item'>
                            {file.resource_type === 'pdf' && (
                              <Icon size='lg' style={{ marginRight: '10px' }} icon='file-pdffo' />
                            )}
                            {file.resource_type === 'image' && (
                              <Icon size='lg' style={{ marginRight: '10px' }} icon='file-image-o' />
                            )}
                            <a className='view-file-link' href={file.url}>{file.original_filename}</a>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </Modal.Body>
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
            :global(.rs-input-group.rs-input-number) {
              max-width: 300px;
            }
            .edit-loader-wrapper {
              width: 100%;
              height: 100px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            :global(.edit-file-wrapper) {
              max-width: 300px;
              min-height: 50px;
              box-shadow: none !important;
              display: flex;
              justify-content: flex-start;
              align-items: center;
              flex-wrap: wrap;
            }
            :global(.edit-file-wrapper .rs-panel-body) {
              padding: 10px;
              display: flex;
              flex-wrap: wrap;
            }
            .view-file-list {
              list-style: none;
            }
            .view-file-list-item {
              padding: 15px;
              border: 1px solid #d6d6d6;
              border-radius: 5px;
              margin: 5px;
              width: 85%;
            }
            .view-file-item {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              font-size: 20px;
            }
            .view-file-link {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
            }
            .view-file-link::before {
              content: '';
              display: inline-block;
              height: 32px;
              width: 5px;
              border-left: 1px solid #d6d6d6;
              top: 0px;
              left: -7px;
              position: absolute;
            }
            .edit-file-item {
              padding: 10px;
              border: 1px solid #d6d6d6;
              border-radius: 5px;
              box-shadow: 0 2px 0 rgba(90,97,105,.11), 0 4px 8px rgba(90,97,105,.02), 0 10px 10px rgba(90,97,105,.06), 0 7px 70px rgba(90,97,105,.1);
              margin: 5px 10px;
            }
            .edit-file-item:hover {
              text-decoration: none;
              cursor: pointer;
              transition: all 250ms ease-in-out;
              box-shadow: 0 2px 0 rgba(90,97,105,.11), 0 4px 8px rgba(90,97,105,.12), 0 10px 10px rgba(90,97,105,.16), 0 7px 70px rgba(90,97,105,.1);
            }
            :global(.section-header) {
              font-size: 1.3rem;
            }
            :global(.ag-cell-label-container) {
              width: 110%;
            }
            :global(.tag-wrapper) {
              box-shadow: 0 2px 0 rgba(90,97,105,.11), 0 4px 8px rgba(90,97,105,.12), 0 10px 10px rgba(90,97,105,.16), 0 7px 70px rgba(90,97,105,.1);
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
