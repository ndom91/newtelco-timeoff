import React from 'react'
import fetch from 'isomorphic-unfetch'
import Layout from '../../components/layout/index'
import Router from 'next/router'
import moment from 'moment-timezone'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../../components/requiredLogin'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import DateField from '../../components/aggrid/date'
import DateTimeField from '../../components/aggrid/datetime'
import DateTimeFieldApproval from '../../components/aggrid/datetimeapproval'
import ApprovedBtn from '../../components/aggrid/approvedbtn'
import ApprovedField from '../../components/aggrid/approved'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Container,
  Header,
  Content,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Notification,
  Modal,
  Alert,
  Panel,
  SelectPicker,
  Table,
  Form,
  FormControl,
  FormGroup,
  ControlLabel,
  Row,
  Col
} from 'rsuite'
import {
  faPencilAlt,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons'

const { Column, HeaderCell, Cell } = Table

class Wrapper extends React.Component {
  static async getInitialProps ({ res, req, query }) {
    if (process.browser) {
      return __NEXT_DATA__.props.pageProps
    }
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
    const host = req ? req.headers['x-forwarded-host'] : window.location.host
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:'
    const pageRequest = `${protocol}//${host}/api/user/list`
    const userRequest = await fetch(pageRequest)
    const userJson = await userRequest.json()
    return {
      session: await NextAuth.init({ req }),
      users: userJson,
      admin: query.admin
    }
  }

  constructor (props) {
    super(props)
    const lastYear = new Date().getFullYear() - 1
    const thisYear = new Date().getFullYear()
    this.state = {
      addCount: 0,
      updateCount: 0,
      showSyncModal: false,
      rowData: props.users.userList,
      openManagerEditModal: false,
      openManagerAddModal: false,
      allUsers: [],
      allRowData: [],
      managerRowData: [],
      activeManager: {
        name: '',
        team: '',
        email: ''
      },
      teamSelectData: [],
      allGridOptions: {
        defaultColDef: {
          resizable: true,
          sortable: true,
          filter: true,
          selectable: false,
          editable: false,
          suppressSizeToFit: true
        },
        columnDefs: [
          {
            headerName: 'ID',
            field: 'id',
            hide: true,
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'Name',
            field: 'name',
            tooltipField: 'name',
            width: 150
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
            width: 200
          }, {
            headerName: 'Days Earned This Year',
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
            width: 200
          }, {
            headerName: 'Type',
            field: 'type',
            width: 130
          }, {
            headerName: 'Submitted',
            cellRenderer: 'dateTimeShort',
            field: 'submitted_datetime',
            width: 160
          }, {
            headerName: 'Approval Date/Time',
            field: 'approval_datetime',
            cellRenderer: 'dateTimeShortApproval',
            width: 160
          }, {
            headerName: 'Approved',
            field: 'approved',
            width: 160,
            cellRenderer: 'approvedbtn',
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
          dateTimeShortApproval: DateTimeFieldApproval,
          dateShort: DateField,
          approvedbtn: ApprovedBtn
        },
        rowSelection: 'multiple',
        paginationPageSize: 10,
        rowClass: 'row-class'
      },
      personalRowData: [],
      personalGridOptions: {
        defaultColDef: {
          resizable: true,
          sortable: true,
          filter: true,
          selectable: false,
          editable: false,
          suppressSizeToFit: true
        },
        columnDefs: [
          {
            headerName: 'ID',
            field: 'id',
            hide: true
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
            width: 200
          }, {
            headerName: 'Days Earned This Year',
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
            width: 200
          }, {
            headerName: 'Type',
            field: 'type',
            width: 130
          }, {
            headerName: 'Submitted',
            cellRenderer: 'dateTimeShort',
            field: 'submitted_datetime',
            sort: { direction: 'desc', priority: 0 },
            width: 160
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
          approved: ApprovedField
        },
        rowSelection: 'multiple',
        paginationPageSize: 10,
        rowClass: 'row-class'
      },
      gridOptions: {
        defaultColDef: {
          resizable: true,
          sortable: true,
          filter: true,
          selectable: false,
          editable: false,
          suppressSizeToFit: true
        },
        columnDefs: [
          {
            headerName: 'ID',
            field: 'id',
            hide: true,
            sort: { direction: 'asc', priority: 0 }
          }, {
            headerName: 'First Name',
            field: 'fname',
            width: 140
          }, {
            headerName: 'Last Name',
            field: 'lname',
            width: 140
          }, {
            headerName: 'Email',
            field: 'email',
            width: 160
          }, {
            headerName: 'Team',
            field: 'team',
            width: 140
          }, {
            headerName: 'Date Joined',
            field: 'dateJoined',
            editable: true,
            cellRenderer: 'dateShort',
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }, {
            headerName: 'Days Available',
            editable: true,
            field: 'daysAvailable',
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
          dateShort: DateField
        },
        rowSelection: 'multiple',
        paginationPageSize: 10,
        rowClass: 'row-class'
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

  handleAdGroupSync = () => {
    const host = window.location.host
    const protocol = window.location.protocol
    const adRequestUrl = `${protocol}//${host}/api/ad`
    fetch(adRequestUrl)
      .then(res => res.json())
      .then(data => {
        const adUsers = []
        data.users.map((user, index) => {
          const group = user.dn.split(',')[1]
          const groupName = group.substr(3, group.length)
          adUsers.push({ id: index, fname: user.givenName, lname: user.sn, email: user.mail, team: groupName })
        })
        const dbUsers = this.state.rowData
        let updateCount = 0
        let addCount = 0
        if (dbUsers > 0 && dbUsers.length !== adUsers.length) {
          dbUsers.forEach(user => {
            const dbUser = dbUsers.filter(duser => duser.email === user.email)
            if (user.fname !== dbUser.fname) user.update = 1 && updateCount++
            if (user.lname !== dbUser.lname) user.update = 1 && updateCount++
          })
        } else {
          addCount = adUsers.length - dbUsers.length
        }
        if (addCount > 0 || updateCount > 0) {
          this.setState({
            addCount: addCount,
            updateCount: updateCount,
            adUsers: adUsers,
            showSyncModal: true,
            rowData: adUsers
          })
        } else {
          Alert.success('User DB is up-to-date with your LDAP Users')
        }
      })
      .catch(err => console.error(err))
  }

  handleConfirmAdSync = () => {
    const {
      adUsers
    } = this.state

    if (adUsers.length > 0) {
      const host = window.location.host
      const protocol = window.location.protocol
      const adRequestUrl = `${protocol}//${host}/api/user/add?u=${JSON.stringify(adUsers)}`
      fetch(adRequestUrl)
        .then(res => res.json())
        .then(data => {
          console.log(data)
          if (data.status === 200) {
            this.setState({
              showSyncModal: false
            })
            Alert.success(`Successfully added ${adUsers.length} users`, 5000)
          } else {
            this.setState({
              showSyncModal: false
            })
            Alert.warn(`Error adding ${adUsers.length} - ${data.error}`)
          }
        })
        .catch(err => console.error(err))
    }
  }

  componentDidMount () {
    const selectUserList = []
    this.props.users.userList.forEach(user => {
      selectUserList.push({ value: user.email, label: `${user.fname} ${user.lname}` })
    })
    this.setState({
      allUsers: selectUserList
    })
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/user/entries/all`)
      .then(res => res.json())
      .then(data => {
        if (data.userEntries) {
          this.setState({
            allRowData: data.userEntries
          })
          // window.gridApi && window.gridApi.refreshCells()
        }
      })
      .catch(err => console.error(err))
    fetch(`${protocol}//${host}/api/managers`)
      .then(res => res.json())
      .then(data => {
        if (data.managerEntries) {
          this.setState({
            managerRowData: data.managerEntries
          })
          // window.gridApi && window.gridApi.refreshCells()
        }
      })
      .catch(err => console.error(err))
  }

  handleSyncModalClose = () => {
    this.setState({ showSyncModal: false })
  }

  open = () => {
    this.setState({ showSyncModal: true })
  }

  handleGridReady = params => {
    params.api.sizeColumnsToFit()
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
  }

  handlePersonalGridReady = params => {
    params.api.sizeColumnsToFit()
    this.personalGridApi = params.api
    this.gridColumnApi = params.columnApi
  }

  handleAllGridReady = params => {
    params.api.sizeColumnsToFit()
    this.allGridApi = params.api
  }

  handleManagerGridReady = params => {
    params.api.sizeColumnsToFit()
    this.managerGridApi = params.api
  }

  handlePersonalGridExport = () => {
    if (this.personalGridApi) {
      const email = this.state.selectedUser
      const username = email.substr(0, email.lastIndexOf('@'))
      const params = {
        allColumns: true,
        fileName: `${username}_timeoff_${moment(new Date()).format('YYYYMMDD')}.csv`,
        columnSeparator: ','
      }
      this.personalGridApi.exportDataAsCsv(params)
    }
  }

  handlePersonalSelectChange = (user) => {
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/user/entries?user=${user}`)
      .then(res => res.json())
      .then(data => {
        if (data.userEntries) {
          this.setState({
            personalRowData: data.userEntries,
            selectedUser: user
          })
          // window.gridApi && window.gridApi.refreshCells()
        }
      })
      .catch(err => console.error(err))
  }

  handleAllGridExport = () => {
    if (this.allGridApi) {
      const params = {
        allColumns: true,
        fileName: `newtelco_allUsers_timeoff_${moment(new Date()).format('YYYYMMDD')}.csv`,
        columnSeparator: ','
      }
      this.allGridApi.exportDataAsCsv(params)
    }
  }

  toggleManagerEditModal = (manager) => {
    if (!this.state.openManagerEditModal) {
      const host = window.location.host
      const protocol = window.location.protocol
      fetch(`${protocol}//${host}/api/team`)
        .then(res => res.json())
        .then(data => {
          const teamsSelect = []
          data.teamInfos.forEach(team => {
            teamsSelect.push({ value: team.id, label: team.name })
          })
          const activeId = data.teamInfos.filter(team => team.name === manager.team)
          this.setState({
            teamSelectData: teamsSelect,
            openManagerEditModal: !this.state.openManagerEditModal,
            activeManager: {
              id: manager.id,
              name: manager.name,
              team: activeId[0].id,
              email: manager.email
            }
          })
        })
        .catch(err => console.error(err))
    } else {
      this.setState({
        openManagerEditModal: !this.state.openManagerEditModal
      })
    }
  }

  toggleManagerAddModal = () => {
    if (!this.state.openManagerAddModal) {
      const host = window.location.host
      const protocol = window.location.protocol
      fetch(`${protocol}//${host}/api/team`)
        .then(res => res.json())
        .then(data => {
          const teamsSelect = []
          data.teamInfos.forEach(team => {
            teamsSelect.push({ value: team.id, label: team.name })
          })
          this.setState({
            teamSelectData: teamsSelect,
            openManagerAddModal: !this.state.openManagerAddModal
          })
        })
        .catch(err => console.error(err))
    } else {
      this.setState({
        openManagerAddModal: !this.state.openManagerAddModal
      })
    }
  }

  handleManagerDelete = (id) => {
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/managers/delete?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.managerDelete && data.managerDelete.affectedRows === 1) {
          const managers = this.state.managerRowData.filter(man => man.id !== id)
          this.setState({
            managerRowData: managers
          })
          this.notifyInfo('Manager Removed')
        }
      })
      .catch(err => console.error(err))
  }

  handleManagerNameChange = (value) => {
    this.setState({
      activeManager: {
        ...this.state.activeManager,
        name: value
      }
    })
  }

  handleManagerTeamChange = (value) => {
    console.log(value)
    this.setState({
      activeManager: {
        ...this.state.activeManager,
        team: value
      }
    })
  }

  handleManagerEmailChange = (value) => {
    this.setState({
      activeManager: {
        ...this.state.activeManager,
        email: value
      }
    })
  }

  handleConfirmManagerSave = () => {
    const host = window.location.host
    const protocol = window.location.protocol
    const {
      id,
      name,
      email,
      team
    } = this.state.activeManager

    fetch(`${protocol}//${host}/api/managers/edit?id=${id}&name=${name}&email=${email}&team=${team}`)
      .then(res => res.json())
      .then(data => {
        if (data.managerEdit && data.managerEdit.affectedRows === 1) {
          const managers = this.state.managerRowData
          // const edittedManager = managers.filter(manager => manager.id === id)
          const activeId = managers.findIndex(man => man.id === id)
          managers[activeId].name = name
          managers[activeId].email = email
          const teamLabel = this.state.teamSelectData.filter(t => t.value === team)
          managers[activeId].team = teamLabel[0].label
          this.setState({
            openManagerEditModal: !this.state.openManagerEditModal,
            managerRowData: managers
          })
          this.notifyInfo('Manager Info Saved')
        }
      })
      .catch(err => console.error(err))
  }

  handleConfirmAddManager = (manager) => {
    const host = window.location.host
    const protocol = window.location.protocol
    const {
      name,
      email,
      team
    } = this.state.activeManager

    fetch(`${protocol}//${host}/api/managers/add?name=${name}&email=${email}&team=${team}`)
      .then(res => res.json())
      .then(data => {
        if (data.managerAdd && data.managerAdd.affectedRows === 1) {
          const managers = this.state.managerRowData
          const teamLabel = this.state.teamSelectData.filter(t => t.value === team)
          managers.push({
            id: data.managerAdd.insertId,
            name: name,
            email: email,
            team: teamLabel[0].label
          })
          this.setState({
            openManagerAddModal: !this.state.openManagerAddModal,
            managerRowData: managers
          })
          this.notifyInfo('Manager Added')
        }
      })
      .catch(err => console.error(err))
  }

  handleCellEdit = (params) => {
    const id = params.data.id
    const daysRemaining = params.data.daysAvailable
    const dateJoined = params.data.dateJoined
    const host = window.location.host
    const protocol = window.location.protocol

    fetch(`${protocol}//${host}/api/settings/user/edit?id=${id}&daysRemaining=${encodeURIComponent(daysRemaining)}&dateJoined=${encodeURIComponent(moment(new Date(dateJoined)).format('YYYY-MM-DD'))}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        console.log(data)
        if (data.userUpdate.affectedRows === 1) {
          this.notifyInfo('User Info Saved')
        } else {
          this.notifyWarn('Error Saving User Info')
        }
      })
      .catch(err => console.error(err))
  }

  render () {
    const {
      gridOptions,
      rowData,
      showSyncModal,
      addCount,
      updateCount,
      personalGridOptions,
      personalRowData,
      allUsers,
      allGridOptions,
      allRowData,
      managerRowData,
      openManagerEditModal,
      openManagerAddModal,
      activeManager,
      teamSelectData
    } = this.state

    if (this.props.session.user && this.props.admin) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <Container className='settings-admin-container'>
            <Row className='settings-admin-row'>
              <Col className='settings-admin-col-2'>
                <Panel
                  bordered
                  style={{
                    width: '100%',
                    display: 'inline-block'
                  }}
                >
                  <Header className='user-content-header'>
                    <h4>Managers</h4>
                    <Button appearance='ghost' onClick={this.toggleManagerAddModal}>Add</Button>
                  </Header>
                  <Table
                    height={400}
                    loading={!managerRowData}
                    data={managerRowData}
                    style={{
                      width: '100%'
                    }}
                  >
                    <Column width={200}>
                      <HeaderCell>Name</HeaderCell>
                      <Cell dataKey='name' />
                    </Column>
                    <Column width={200}>
                      <HeaderCell>Email</HeaderCell>
                      <Cell dataKey='email' />
                    </Column>
                    <Column width={200}>
                      <HeaderCell>Team</HeaderCell>
                      <Cell dataKey='team' />
                    </Column>
                    <Column width={120} fixed='right'>
                      <HeaderCell>Action</HeaderCell>
                      <Cell style={{ padding: '8px' }}>
                        {rowData => {
                          const handleEdit = () => {
                            this.toggleManagerEditModal(rowData)
                          }
                          const handleDelete = () => {
                            this.handleManagerDelete(rowData.id)
                          }
                          return (
                            <span>
                              <ButtonToolbar>
                                <ButtonGroup>
                                  <Button size='sm' appearance='ghost' onClick={handleEdit}>
                                    <FontAwesomeIcon icon={faPencilAlt} width='0.8rem' />
                                  </Button>
                                  <Button size='sm' appearance='ghost' onClick={handleDelete}>
                                    <FontAwesomeIcon icon={faTrashAlt} width='0.7rem' />
                                  </Button>
                                </ButtonGroup>
                              </ButtonToolbar>
                            </span>
                          )
                        }}
                      </Cell>
                    </Column>
                  </Table>
                </Panel>
              </Col>
              <Col className='settings-admin-col-2'>
                <Panel
                  bordered
                  style={{
                    width: '100%',
                    display: 'inline-block'
                  }}
                >
                  <Header className='user-content-header'>
                    <h4>Users</h4>
                    <Button appearance='ghost' onClick={this.handleAdGroupSync}>Sync Domain Users</Button>
                  </Header>
                  <Content className='user-grid-wrapper'>
                    <div className='ag-theme-material user-grid manager-user-wrapper'>
                      <AgGridReact
                        gridOptions={gridOptions}
                        rowData={rowData}
                        onGridReady={this.handleGridReady}
                        animateRows
                        onCellEditingStopped={this.handleCellEdit}
                        stopEditingWhenGridLosesFocus
                        deltaRowDataMode
                        getRowNodeId={(data) => {
                          return data.id
                        }}
                        pagination
                        style={{ width: '100%' }}
                      />
                    </div>
                  </Content>
                </Panel>
              </Col>
            </Row>
            <Panel bordered>
              <Header className='user-content-header'>
                <span className='section-header'>
                  <h4>Per Person</h4>
                </span>
                <Button appearance='ghost' onClick={this.handlePersonalGridExport}>Export</Button>
              </Header>
              <Content className='user-grid-wrapper'>
                <SelectPicker
                  onChange={this.handlePersonalSelectChange}
                  data={allUsers}
                  placeholder='Please Select a User'
                  style={{ width: '300px' }}
                />
                <div className='ag-theme-material user-grid'>
                  <AgGridReact
                    gridOptions={personalGridOptions}
                    rowData={personalRowData}
                    onGridReady={this.handlePersonalGridReady}
                    animateRows
                    pagination
                  />
                </div>
              </Content>
            </Panel>
            <Panel bordered>
              <Header className='user-content-header'>
                <span className='section-header'>
                  <h4>All Colleagues</h4>
                </span>
                <Button appearance='ghost' onClick={this.handleAllGridExport}>Export</Button>
              </Header>
              <Content className='user-grid-wrapper'>
                <div className='ag-theme-material user-grid'>
                  <AgGridReact
                    gridOptions={allGridOptions}
                    rowData={allRowData}
                    onGridReady={this.handleAllGridReady}
                    animateRows
                    pagination
                  />
                </div>
              </Content>
            </Panel>
          </Container>
          <Modal show={showSyncModal} onHide={this.handleSyncModalClose}>
            <Modal.Header>
              <Modal.Title>LDAP User Sync</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                You have <b>{updateCount}</b> Users which need to be updated and <b>{addCount}</b> users which need to be added.
              </p>
              <p>
                Would you like to proceed?
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleConfirmAdSync} appearance='primary'>
                Submit
              </Button>
              <Button onClick={this.handleSyncModalClose} appearance='subtle'>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal
            show={openManagerEditModal}
            onHide={this.toggleManagerEditModal}
            style={{
              width: '350px'
            }}
          >
            <Modal.Header>
              <Modal.Title>Edit Manager</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <FormGroup>
                  <ControlLabel>Name</ControlLabel>
                  <FormControl onChange={this.handleManagerNameChange} name='name' value={activeManager.name} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Email</ControlLabel>
                  <FormControl onChange={this.handleManagerEmailChange} name='email' type='email' value={activeManager.email} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Team</ControlLabel>
                  {/* <FormControl onChange={this.handleManagerTeamChange} name='team' value={activeManager.team} /> */}
                  <SelectPicker
                    onChange={this.handleManagerTeamChange}
                    value={activeManager.team}
                    style={{ width: '100%' }}
                    searchable={false}
                    data={teamSelectData}
                  />
                </FormGroup>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleConfirmManagerSave} appearance='primary'>
                Save
              </Button>
              <Button onClick={this.toggleManagerEditModal} appearance='subtle'>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal
            show={openManagerAddModal}
            onHide={this.toggleManagerAddModal}
            style={{
              width: '350px'
            }}
          >
            <Modal.Header>
              <Modal.Title>Add Manager</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <FormGroup>
                  <ControlLabel>Name</ControlLabel>
                  <FormControl onChange={this.handleManagerNameChange} name='name' value={activeManager.name} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Email</ControlLabel>
                  <FormControl onChange={this.handleManagerEmailChange} name='email' type='email' value={activeManager.email} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Team</ControlLabel>
                  {/* <FormControl onChange={this.handleManagerTeamChange} name='team' value={activeManager.team} /> */}
                  <SelectPicker
                    onChange={this.handleManagerTeamChange}
                    value={activeManager.team}
                    style={{ width: '100%' }}
                    searchable={false}
                    data={teamSelectData}
                  />
                </FormGroup>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleConfirmAddManager} appearance='primary'>
                Save
              </Button>
              <Button onClick={this.toggleManagerAddModal} appearance='subtle'>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
          <style jsx>{`
            :global(.settings-admin-container > .rs-panel) {
              margin: 10px;
            }
            :global(.settings-admin-row) {
              display: flex;
              align-items: flex-start;
              justify-content: space-around;
            }
            :global(.settings-admin-col-2) {
               display: inline;
               width: 50%;
               margin: 10px;
               padding: 10px;
            }
            :global(.manager-user-wrapper > div) {
              width: 100%; 
            }
            :global(.manager-user-wrapper) {
              display: flex;
              flex-wrap: nowrap;
            }
            :global(.accordion__heading) {
              background-color: #ececec;
              padding: 15px;
              border-radius: 5px;
              margin-top: 10px;
            }
            :global(.accordion__heading:hover) {
              cursor: pointer;
            }
            :global(.user-content-header) {
              display: flex;
              width: 100%;
              justify-content: space-between;
            }
            :global(.accordion__button:focus) {
              outline: none;
            }
            :global(.user-content-header:focus) {
              outline: none;
            }
            :global(.user-grid-wrapper) {
              height: 50vh;
            }
            :global(.user-grid) {
              height: 50vh;
            }
            :global(.row-awaitingResponse) {
              background-color: transparent;
            }
            :global(.section-header) {
              font-size: 1.3rem;
            }
            :global(.rs-table) {
              max-width: 100%;
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
