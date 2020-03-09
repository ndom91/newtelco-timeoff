import React from 'react'
import fetch from 'isomorphic-unfetch'
import Layout from '../../components/layout/index'
import Router from 'next/router'
import moment from 'moment-timezone'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../../components/requiredLogin'
import EditModal from '../../components/editRequestModal'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import DateField from '../../components/aggrid/date'
import DateTimeField from '../../components/aggrid/datetime'
import Uppercase from '../../components/aggrid/uppercase'
import DateTimeFieldApproval from '../../components/aggrid/datetimeapproval'
import ApprovedBtn from '../../components/aggrid/approvedbtn'
import ApprovedField from '../../components/aggrid/approved'
import ViewFiles from '../../components/aggrid/viewfiles'
import Subheader from '../../components/content-subheader'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ResponsiveSwarmPlot } from '@nivo/swarmplot'
import {
  Container,
  Header,
  Content,
  Button,
  IconButton,
  Icon,
  ButtonGroup,
  ButtonToolbar,
  Notification,
  Modal,
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
    const host = req ? req.headers['x-forwarded-host'] : location.host
    const protocol = typeof window === 'undefined' ? 'http:' : window.location.protocol
    const pageRequest = `${protocol}//${host || 'localhost:3000'}/api/user/list`
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
    const thisYear = new Date().getFullYear()
    this.state = {
      plotData: [],
      addCount: 0,
      allMonths: [],
      allYears: [],
      viewFiles: [],
      updateCount: 0,
      showSyncModal: false,
      rowData: props.users.userList,
      openManagerEditModal: false,
      openManagerAddModal: false,
      openConfirmDeleteModal: false,
      openConfirmPersonalDeleteModal: false,
      openAdminEditModal: false,
      openPersonalEditModal: false,
      viewFilesModals: false,
      admin: props.admin,
      adLoading: false,
      personalEditData: {
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
      allUserType: 'vacation',
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
            width: 200
          }, {
            headerName: 'Type',
            field: 'type',
            cellRenderer: 'uppercase',
            width: 130
          }, {
            headerName: 'Submitted',
            cellRenderer: 'dateTimeShort',
            field: 'submitted_datetime',
            width: 160
          }, {
            headerName: 'Submitted By',
            field: 'submitted_by',
            width: 140
          }, {
            headerName: 'Approval Date/Time',
            field: 'approval_datetime',
            cellRenderer: 'dateTimeShortApproval',
            width: 160
          }, {
            headerName: 'Manager',
            field: 'manager',
            width: 160
          }, {
            headerName: 'Notes',
            field: 'note',
            tooltipField: 'note',
            width: 160
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
          approvedbtn: ApprovedBtn,
          uppercase: Uppercase,
          viewfiles: ViewFiles
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
            width: 200
          }, {
            headerName: 'Type',
            cellRenderer: 'uppercase',
            field: 'type',
            width: 130
          }, {
            headerName: 'Submitted',
            cellRenderer: 'dateTimeShort',
            field: 'submitted_datetime',
            sort: { direction: 'desc', priority: 0 },
            width: 160
          }, {
            headerName: 'Submitted By',
            field: 'submitted_by',
            width: 140
          }, {
            headerName: 'Approval Date/Time',
            field: 'approval_datetime',
            cellRenderer: 'dateTimeShort',
            width: 160
          }, {
            headerName: 'Manager',
            field: 'manager',
            width: 160
          }, {
            headerName: 'Notes',
            field: 'note',
            tooltipField: 'note',
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
          uppercase: Uppercase,
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
          dateShort: DateField,
          dateEditor: DateField
        },
        rowSelection: 'multiple',
        paginationPageSize: 10,
        rowClass: 'row-class'
      }
    }
  }

  componentDidMount () {
    const selectUserList = []
    const userAdmin = JSON.parse(window.localStorage.getItem('mA'))
    this.props.users.userList.forEach(user => {
      selectUserList.push({ value: user.email, label: `${user.fname} ${user.lname}` })
    })
    const allYears = []
    const yearNow = moment().format('YYYY')
    for (let i = 0; i < 3; i++) {
      const yearNowLoop = yearNow - i
      allYears.push({ value: yearNowLoop, label: yearNowLoop })
    }
    const allMonths = []
    const monthNow = moment()
    for (let i = 0; i < 12; i++) {
      const monthNowLoop = moment(monthNow).subtract(i, 'months').format('MMMM YYYY')
      allMonths.push({ value: monthNowLoop, label: monthNowLoop })
    }

    this.setState({
      allUsers: selectUserList,
      admin: userAdmin,
      allMonths,
      allYears
    })
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/user/entries/all?t=vacation`)
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
    const year = moment().format('YYYY') - 1
    fetch(`${protocol}//${host}/api/report/swarmplot?y=${year}`)
      .then(res => res.json())
      .then(data => {
        if (data.query) {
          this.setState({
            plotData: data.query
          })
        }
      })
      .catch(err => console.error(err))
  }

  componentDidUpdate = () => {
    const type = this.state.allUserType
    if (this.allGridColumnApi) {
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
          this.allGridColumnApi.setColumnVisible(column, false)
        })
      } else {
        sickHideColumns.forEach(column => {
          this.allGridColumnApi.setColumnVisible(column, true)
        })
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

  notifyError = (header, text) => {
    Notification.error({
      title: header,
      duration: 3000,
      description: <div className='notify-body'>{text}</div>
    })
  }

  notifySuccess = (header, text) => {
    Notification.success({
      title: header,
      duration: 3000,
      description: <div className='notify-body'>{text}</div>
    })
  }

  handleAllUserTypeChange = (selection) => {
    const host = window.location.host
    const protocol = window.location.protocol
    const type = selection
    fetch(`${protocol}//${host}/api/user/entries/all?t=${type}`)
      .then(res => res.json())
      .then(data => {
        if (data.userEntries) {
          this.setState({
            allRowData: data.userEntries,
            allUserType: type
          })
          // window.gridApi && window.gridApi.refreshCells()
        }
      })
      .catch(err => console.error(err))
  }

  handleAdGroupSync = () => {
    this.setState({
      adLoading: true
    })
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/ldap`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 500) {
          this.notifyError('Error', 'Error connecting to LDAP Server')
          return
        }
        const adUsers = []
        data.users.map((user, index) => {
          const group = user.dn.split(',')[1]
          const groupName = group.substr(3, group.length)
          adUsers.push({ id: index, fname: user.givenName, lname: user.sn, email: user.mail, team: groupName })
        })
        const dbUsers = this.state.rowData
        let updateCount = 0
        let addCount = 0
        let newUsers = []
        const updateUsers = []
        // check for updates to users (fname, lname, team)
        if (dbUsers.length > 0) {
          dbUsers.forEach(user => {
            let updateUser = 0
            const adUser = adUsers.filter(aduser => aduser.email === user.email)
            if (adUser.length > 0) {
              if (user.fname !== adUser[0].fname) user.update = 1 && updateUser++
              if (user.lname !== adUser[0].lname) user.update = 1 && updateUser++
              if (user.team !== adUser[0].team) user.update = 1 && updateUser++
              if (updateUser !== 0) {
                updateCount++
                updateUsers.push(adUser[0].id)
              }
            }
          })
        }
        // check if there are new users in AD not in DB
        if (dbUsers.length !== adUsers.length) {
          // filter out users without email
          const usersWithEmail = adUsers.filter(user => user.email !== undefined)
          newUsers = usersWithEmail.filter(({ email: id1 }) => !dbUsers.some(({ email: id2 }) => id2 === id1))
          addCount = newUsers.length
        }
        if (addCount > 0 || updateCount > 0) {
          this.setState({
            addCount: addCount,
            updateCount: updateCount,
            updateUsers: updateUsers,
            newUsersToDb: newUsers,
            adUsers: adUsers,
            showSyncModal: true,
            adLoading: false
            // rowData: adUsers
          })
        } else {
          this.setState({
            adLoading: false
          })
          this.notifySuccess('Success', 'Users up-to-date with LDAP')
        }
      })
      .catch(err => console.error(err))
  }

  handleConfirmAdSync = () => {
    const {
      newUsersToDb,
      updateUsers,
      adUsers
    } = this.state

    if (newUsersToDb.length > 0) {
      const host = window.location.host
      const protocol = window.location.protocol
      fetch(`${protocol}//${host}/api/user/add`, {
        method: 'POST',
        body: JSON.stringify({
          users: newUsersToDb
        }),
        headers: {
          'X-CSRF-TOKEN': this.props.session.csrfToken
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 200) {
            const users = this.state.rowData
            newUsersToDb.forEach(user => {
              users.push(user)
            })
            this.setState({
              rowData: users,
              showSyncModal: false
            })
            if (this.gridApi) { this.gridApi.refreshCells() }
            this.notifySuccess('Success', `Successfully added ${newUsersToDb.length} users`, 5000)
          } else {
            this.setState({
              showSyncModal: false
            })
            this.notifyWarn('Warning', `Error adding ${newUsersToDb.length} - ${data.error}`)
          }
        })
        .catch(err => console.error(err))
    }
    if (updateUsers.length > 0) {
      const host = window.location.host
      const protocol = window.location.protocol
      const updateUserDetails = []
      updateUsers.forEach(user => {
        const adUser = adUsers.find(adUser => adUser.id === user)
        updateUserDetails.push(adUser)
      })
      fetch(`${protocol}//${host}/api/user/update`, {
        method: 'POST',
        body: JSON.stringify({
          users: updateUserDetails
        }),
        headers: {
          'X-CSRF-TOKEN': this.props.session.csrfToken
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 200) {
            const users = this.state.rowData
            updateUserDetails.forEach(user => {
              const toUpdateUserId = users.indexOf(u => u.email === user.email)
              users[toUpdateUserId].fname = user.fname
              users[toUpdateUserId].lname = user.lname
              users[toUpdateUserId].team = user.team
            })
            this.setState({
              rowData: users,
              showSyncModal: false
            })
            if (this.gridApi) { this.gridApi.refreshCells() }
            this.notifySuccess('Success', `Successfully updated ${updateUsers.length} users`, 5000)
          } else {
            this.setState({
              showSyncModal: false
            })
            this.notifyWarn('Warning', `Error updating ${updateUsers.length} - ${data.error}`)
          }
        })
        .catch(err => console.error(err))
    }
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
    this.allGridColumnApi = params.columnApi
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
        columnSeparator: ';'
      }
      this.personalGridApi.exportDataAsCsv(params)
    }
  }

  handlePersonalSelectChange = (user) => {
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/user/entries?user=${user}&t=vacation`)
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
        columnSeparator: ';'
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

  toggleViewFilesModal = (files) => {
    this.setState({
      viewFilesModal: !this.state.viewFilesModal,
      viewFiles: files
    })
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
    // const dateJoined = params.data.dateJoined
    const host = window.location.host
    const protocol = window.location.protocol

    const date = params.data.dateJoined.split('.')
    const day = date[0]
    const month = date[1]
    const year = date[2]

    fetch(`${protocol}//${host}/api/settings/user/edit?id=${id}&daysRemaining=${encodeURIComponent(daysRemaining)}&dateJoined=${encodeURIComponent(`${year}-${month}-${day}`)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.userUpdate.affectedRows === 1) {
          this.notifyInfo('User Info Saved')
        } else {
          this.notifyError('Error Saving User Info')
        }
      })
      .catch(err => console.error(err))
  }

  j
  handleDeleteFromPersonalModal = () => {
    if (this.personalGridApi) {
      const selectedRow = this.personalGridApi.getSelectedRows()
      if (!selectedRow[0]) {
        this.notifyWarn('Please select a row')
        return
      }
      const request = selectedRow[0]
      let tableData = []
      if (request.type === 'sick') {
        tableData = [
          {
            title: 'Colleague',
            value: request.name
          },
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
            title: 'Submitted On',
            value: moment(request.submitted_datetime).format('DD.MM.YYYY HH:mm')
          }
        ]
      } else {
        tableData = [
          {
            title: 'Colleague',
            value: request.name
          },
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
          },
          {
            title: 'Submitted On',
            value: moment(request.submitted_datetime).format('DD.MM.YYYY HH:mm')
          }
        ]
      }
      this.setState({
        openConfirmPersonalDeleteModal: !this.state.openConfirmPersonalDeleteModal,
        confirmPersonalDeleteData: tableData,
        personalToDelete: request.id || 0
      })
    }
  }

  handleDeleteFromAllModal = () => {
    if (this.allGridApi) {
      const selectedRow = this.allGridApi.getSelectedRows()
      if (!selectedRow[0]) {
        this.notifyWarn('Please select a row')
        return
      }
      const request = selectedRow[0]
      let tableData = []
      if (request.type === 'sick') {
        tableData = [
          {
            title: 'Colleague',
            value: request.name
          },
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
            title: 'Submitted On',
            value: moment(request.submitted_datetime).format('DD.MM.YYYY HH:mm')
          }
        ]
      } else {
        tableData = [
          {
            title: 'Colleague',
            value: request.name
          },
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
          },
          {
            title: 'Submitted On',
            value: moment(request.submitted_datetime).format('DD.MM.YYYY HH:mm')
          }
        ]
      }
      this.setState({
        openConfirmDeleteModal: !this.state.openConfirmDeleteModal,
        confirmDeleteData: tableData,
        toDelete: request.id || 0
      })
    }
  }

  handleSubmitPersonalDelete = () => {
    const deleteId = this.state.personalToDelete
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/user/entries/delete?id=${deleteId}`)
      .then(res => res.json())
      .then(data => {
        if (data.deleteQuery.affectedRows > 0) {
          this.notifySuccess('Request Deleted')
        } else {
          this.notifyError('Error Deleting Request')
        }
        const newRowData = this.state.personalRowData.filter(row => row.id !== deleteId)
        this.setState({
          personalRowData: newRowData,
          openConfirmPersonalDeleteModal: !this.state.openConfirmPersonalDeleteModal
        })
        this.allGridApi.refreshCells()
      })
      .catch(err => console.error(err))
  }

  handleSubmitDelete = () => {
    const deleteId = this.state.toDelete
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/user/entries/delete?id=${deleteId}`)
      .then(res => res.json())
      .then(data => {
        if (data.deleteQuery.affectedRows > 0) {
          this.notifySuccess('Request Deleted')
        } else {
          this.notifyError('Error Deleting Request')
        }
        const newRowData = this.state.allRowData.filter(row => row.id !== deleteId)
        this.setState({
          allRowData: newRowData,
          openConfirmDeleteModal: !this.state.openConfirmDeleteModal
        })
        this.allGridApi.refreshCells()
      })
      .catch(err => console.error(err))
  }

  convertToCSV = (objArray) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
    let str = ''

    for (let i = 0; i < array.length; i++) {
      let line = ''
      for (const index in array[i]) {
        if (line !== '') line += '";"'
        line += array[i][index]
      }
      str += '"' + line + '"\r\n'
    }
    return str
  }

  exportCSVFile = (headers, items, fileTitle) => {
    if (headers) {
      items.unshift(headers)
    }
    const jsonObject = JSON.stringify(items)
    const csv = this.convertToCSV(jsonObject)
    const exportedFilenmae = fileTitle + '.csv' || 'export.csv'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, exportedFilenmae)
    } else {
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', exportedFilenmae)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  handleMonthReportExport = () => {
    const host = window.location.host
    const protocol = window.location.protocol
    const date = this.state.reportSelection.month
    fetch(`${protocol}//${host}/api/report/month?m=${JSON.stringify(date)}`)
      .then(resp => resp.json())
      .then(data => {
        const exportData = []
        data.query.forEach(data => {
          exportData.push({
            id: data.id,
            name: data.name,
            email: data.email,
            lastYear: data.resturlaubVorjahr,
            thisYear: data.jahresurlaubInsgesamt,
            spent: data.jahresUrlaubAusgegeben,
            total: data.restjahresurlaubInsgesamt,
            requested: data.beantragt,
            remaining: data.resturlaubJAHR,
            type: data.type,
            from: moment(data.fromDate).format('DD.MM.YYYY'),
            to: moment(data.toDate).format('DD.MM.YYYY'),
            manager: data.manager,
            note: data.note,
            submitted: moment(data.submitted_datetime).format('DD.MM.YYYY HH:mm'),
            submittedBy: data.submitted_by,
            approvedDateTime: moment(data.approval_datetime).format('DD.MM.YYYY HH:mm')
          })
        })
        const headers = {
          id: 'ID',
          name: 'Name',
          email: 'Email',
          lastYear: 'Last Year',
          thisYear: 'This Year',
          spent: 'Spent this Year',
          total: 'Total Available',
          requested: 'Requested',
          remaining: 'Remaining',
          type: 'Type',
          from: 'From',
          to: 'To',
          manager: 'Manager',
          note: 'Note',
          submitted: 'Submitted',
          submittedBy: 'Submmitted By',
          approvedDateTime: 'Approved Date/Time'
        }
        this.exportCSVFile(headers, exportData, `${date.month}${date.year}_vacation_export`)
      })
  }

  handleMonthReportSelectChange = (selection) => {
    const monthName = selection.split(' ')[0]
    const year = selection.split(' ')[1]
    const month = {
      month: moment().month(monthName).format('MM'),
      year: year
    }
    this.setState({
      reportSelection: {
        ...this.state.reportSelection,
        month: month
      }
    })
  }

  handleYearReportExport = () => {
    const host = window.location.host
    const protocol = window.location.protocol
    const year = this.state.reportSelection.year
    fetch(`${protocol}//${host}/api/report/year?y=${year}`)
      .then(resp => resp.json())
      .then(data => {
        const exportData = []
        data.query.forEach(data => {
          exportData.push({
            id: data.id,
            name: data.name,
            email: data.email,
            lastYear: data.resturlaubVorjahr,
            thisYear: data.jahresurlaubInsgesamt,
            spent: data.jahresUrlaubAusgegeben,
            total: data.restjahresurlaubInsgesamt,
            requested: data.beantragt,
            remaining: data.resturlaubJAHR,
            type: data.type,
            from: moment(data.fromDate).format('DD.MM.YYYY'),
            to: moment(data.toDate).format('DD.MM.YYYY'),
            manager: data.manager,
            note: data.note,
            submitted: moment(data.submitted_datetime).format('DD.MM.YYYY HH:mm'),
            submittedBy: data.submitted_by,
            approvedDateTime: moment(data.approval_datetime).format('DD.MM.YYYY HH:mm')
          })
        })
        const headers = {
          id: 'ID',
          name: 'Name',
          email: 'Email',
          lastYear: 'Last Year',
          thisYear: 'This Year',
          spent: 'Spent this Year',
          total: 'Total Available',
          requested: 'Requested',
          remaining: 'Remaining',
          type: 'Type',
          from: 'From',
          to: 'To',
          manager: 'Manager',
          note: 'Note',
          submitted: 'Submitted',
          submittedBy: 'Submmitted By',
          approvedDateTime: 'Approved Date/Time'
        }
        this.exportCSVFile(headers, exportData, `${year}_vacation_export`)
      })
  }

  handleYearReportSelectChange = (selection) => {
    this.setState({
      reportSelection: {
        ...this.state.reportSelection,
        year: selection
      }
    })
  }

  handleYearTDReportExport = () => {
    const host = window.location.host
    const protocol = window.location.protocol
    const year = this.state.reportSelection.ytd
    fetch(`${protocol}//${host}/api/report/ytd?y=${year}`)
      .then(resp => resp.json())
      .then(data => {
        const exportData = []
        data.query.forEach(data => {
          exportData.push({
            id: data.id,
            name: data.name,
            email: data.email,
            remaining: data.resturlaubJAHR,
            submitted: moment(data.submitted_datetime).format('DD.MM.YYYY HH:mm')
          })
        })
        const headers = {
          id: 'ID',
          name: 'Name',
          email: 'Email',
          remaining: `Remaining from ${year}`,
          submitted: 'Submitted On'
        }
        this.exportCSVFile(headers, exportData, `${year}_daysLeftOver_export`)
      })
  }

  handleYearTDReportSelectChange = (selection) => {
    this.setState({
      reportSelection: {
        ...this.state.reportSelection,
        ytd: selection
      }
    })
  }

  setPersonalEditData = (files, data) => {
    if (!data) {
      this.setState({
        files: files
      })
    } else {
      this.setState({
        personalEditData: data,
        files: files
      })
    }
  }

  setPersonalRowData = (data) => {
    this.setState({
      personalRowData: data
    })
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
      allRowData: data
    })
  }

  togglePersonalEditModal = () => {
    if (this.personalGridApi) {
      const host = window.location.host
      const protocol = window.location.protocol
      const selectedRow = this.personalGridApi.getSelectedRows()
      if (!selectedRow[0]) {
        this.notifyInfo('Please select a row to edit')
        return
      }
      const request = selectedRow[0]
      this.setState({
        loadingFiles: true,
        editAvailable: true
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
            personalEditData: tableData,
            files: files,
            loadingFiles: false,
            openPersonalEditModal: !this.state.openPersonalEditModal
          })
        })
        .catch(err => console.error(err))
    }
  }

  toggleAdminEditModal = () => {
    if (this.allGridApi) {
      const host = window.location.host
      const protocol = window.location.protocol
      const selectedRow = this.allGridApi.getSelectedRows()
      if (!selectedRow[0]) {
        this.notifyInfo('Please select a row to edit')
        return
      }
      const request = selectedRow[0]
      this.setState({
        loadingFiles: true,
        editAvailable: true
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
            openAdminEditModal: !this.state.openAdminEditModal
          })
        })
        .catch(err => console.error(err))
    }
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
      teamSelectData,
      allMonths,
      allYears,
      plotData,
      viewFilesModal,
      viewFiles,
      openConfirmDeleteModal,
      openConfirmPersonalDeleteModal,
      openAdminEditModal,
      openPersonalEditModal,
      editData,
      personalEditData,
      confirmDeleteData,
      confirmPersonalDeleteData,
      adLoading
    } = this.state

    if (this.props.session.user && this.state.admin) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <Container className='settings-admin-container'>
            <Subheader header='Administration' subheader='Manage Company' />
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
                    <IconButton icon={<Icon icon='plus' />} appearance='ghost' onClick={this.toggleManagerAddModal}>
                      Add
                    </IconButton>
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
                            <ButtonToolbar>
                              <ButtonGroup>
                                <Button size='sm' className='manager-btn' appearance='ghost' onClick={handleEdit}>
                                  <FontAwesomeIcon icon={faPencilAlt} width='0.8rem' />
                                </Button>
                                <Button size='sm' className='manager-btn' appearance='ghost' onClick={handleDelete}>
                                  <FontAwesomeIcon icon={faTrashAlt} width='0.7rem' />
                                </Button>
                              </ButtonGroup>
                            </ButtonToolbar>
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
                    <IconButton icon={<Icon className={adLoading ? 'loading' : ''} icon='refresh' />} appearance='ghost' onClick={this.handleAdGroupSync}>
                      Sync Domain Users
                    </IconButton>
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
            <Row>
              <Col className='settings-admin-col-1'>
                <Panel bordered className='person-panel-body'>
                  <Tabs>
                    <TabList className='table-tab-list'>
                      <Tab>All Colleagues</Tab>
                      <Tab>Individual People</Tab>
                    </TabList>
                    <TabPanel>
                      <Header className='user-content-header'>
                        <span className='section-header'>
                          <span style={{ fontSize: '1rem', marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                            Type:
                          </span>
                          <SelectPicker
                            defaultValue='vacation'
                            onChange={this.handleAllUserTypeChange}
                            data={[
                              { label: 'Vacation', value: 'vacation' },
                              { label: 'Sick', value: 'sick' },
                              { label: 'Trip', value: 'trip' },
                              { label: 'Moving', value: 'moving' },
                              { label: 'Other', value: 'other' }
                            ]}
                            placeholder='Please Select a Type'
                            style={{ width: '300px' }}
                          />
                        </span>
                        <span>
                          <ButtonToolbar>
                            <ButtonGroup>
                              <IconButton icon={<Icon icon='pencil' />} appearance='primary' onClick={this.toggleAdminEditModal}>
                                Edit
                              </IconButton>
                              <IconButton icon={<Icon icon='trash' />} appearance='ghost' onClick={this.handleDeleteFromAllModal}>
                                Delete
                              </IconButton>
                              <IconButton icon={<Icon icon='export' />} appearance='ghost' onClick={this.handleAllGridExport}>
                                Export
                              </IconButton>
                            </ButtonGroup>
                          </ButtonToolbar>
                        </span>
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
                    </TabPanel>
                    <TabPanel>
                      <Header className='user-content-header'>
                        <span className='section-header'>
                          <SelectPicker
                            onChange={this.handlePersonalSelectChange}
                            data={allUsers}
                            placeholder='Please Select a User'
                            style={{ width: '300px' }}
                          />
                        </span>
                        <ButtonToolbar>
                          <ButtonGroup>
                            <IconButton icon={<Icon icon='pencil' />} appearance='primary' onClick={this.togglePersonalEditModal}>
                              Edit
                            </IconButton>
                            <IconButton icon={<Icon icon='trash' />} appearance='ghost' onClick={this.handleDeleteFromPersonalModal}>
                              Delete
                            </IconButton>
                            <IconButton icon={<Icon icon='export' />} appearance='ghost' onClick={this.handlePersonalGridExport}>
                              Export
                            </IconButton>
                          </ButtonGroup>
                        </ButtonToolbar>
                      </Header>
                      <Content className='user-grid-wrapper'>
                        <div className='ag-theme-material user-grid person-grid'>
                          <AgGridReact
                            gridOptions={personalGridOptions}
                            rowData={personalRowData}
                            onGridReady={this.handlePersonalGridReady}
                            animateRows
                            pagination
                          />
                        </div>
                      </Content>
                    </TabPanel>
                  </Tabs>
                </Panel>
              </Col>
            </Row>
            <Row className='settings-admin-row'>
              <Col style={{ width: '30%' }} className='settings-admin-col-2'>
                <Panel bordered className='person-panel-body reports-panel'>
                  <Header className='user-content-header reports-header'>
                    <h4>Reports</h4>
                  </Header>
                  <Panel bordered style={{ boxShadow: 'none' }}>
                    <Panel style={{ boxShadow: 'none' }}>
                      <FormGroup>
                        <ControlLabel>Monthly</ControlLabel>
                        <SelectPicker
                          onChange={this.handleMonthReportSelectChange}
                          data={allMonths}
                          placeholder='Please Select a month'
                        />
                        <IconButton block icon={<Icon icon='export' />} appearance='ghost' onClick={this.handleMonthReportExport}>
                          Export
                        </IconButton>
                      </FormGroup>
                    </Panel>
                    <hr className='reports-hr' />
                    <Panel style={{ boxShadow: 'none' }}>
                      <FormGroup>
                        <ControlLabel>Yearly</ControlLabel>
                        <SelectPicker
                          onChange={this.handleYearReportSelectChange}
                          data={allYears}
                          placeholder='Please select a year'
                          searchable={false}
                        />
                        <IconButton block icon={<Icon icon='export' />} appearance='ghost' onClick={this.handleYearReportExport}>
                          Export
                        </IconButton>
                      </FormGroup>
                    </Panel>
                    <hr className='reports-hr' />
                    <Panel style={{ boxShadow: 'none' }}>
                      <FormGroup>
                        <ControlLabel>Year-end left-over</ControlLabel>
                        <SelectPicker
                          onChange={this.handleYearTDReportSelectChange}
                          data={allYears}
                          placeholder='Please select a year'
                          searchable={false}
                        />
                        <IconButton block icon={<Icon icon='export' />} appearance='ghost' onClick={this.handleYearTDReportExport}>
                          Export
                        </IconButton>
                      </FormGroup>
                    </Panel>
                  </Panel>
                </Panel>
              </Col>
              <Col style={{ width: '70%' }} className='settings-admin-col-2'>
                <Panel bordered className='person-panel-body'>
                  <Header style={{ marginBottom: '20px' }} className='user-content-header'>
                    <h4>Charts</h4>
                  </Header>
                  <Panel bordered style={{ boxShadow: 'none' }}>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveSwarmPlot
                        data={plotData}
                        groups={['Technik', 'Order', 'Sales', 'Empfang', 'Billing', 'Marketing']}
                        groupBy='group'
                        identity='id'
                        value='date'
                        valueScale={{ type: 'linear', min: 1, max: 12, reverse: false }}
                        size={{ key: 'volume', values: [0, 24], sizes: [2, 40] }}
                        label='name'
                        spaceing={4}
                        layout='vertical'
                        forceStrength={4}
                        isInteractive={false}
                        simulationIterations={100}
                        colors={{ scheme: 'set2' }}
                        borderColor={{
                          from: 'color',
                          modifiers: [
                            [
                              'darker',
                              0.7
                            ],
                            [
                              'opacity',
                              0.3
                            ]
                          ]
                        }}
                        margin={{ top: 20, right: 10, bottom: 40, left: 40 }}
                        axisBottom={{
                          orient: 'bottom',
                          tickSize: 10,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: 'Teams',
                          legendPosition: 'middle',
                          legendOffset: 46
                        }}
                        axisLeft={{
                          orient: 'left',
                          tickSize: 10,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: 'Month',
                          legendPosition: 'middle',
                          legendOffset: -36
                        }}
                        animate={false}
                      />
                    </div>
                  </Panel>
                </Panel>
              </Col>
            </Row>
          </Container>
          {showSyncModal && (
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
          )}
          {openManagerEditModal && (
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
          )}
          {openManagerAddModal && (
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
                {viewFiles && viewFiles.map((file, index) => {
                  return (
                    <div className='view-file-item' key={index}>
                      <a href={file.url}>{file.name}</a>
                    </div>
                  )
                })}
              </Modal.Body>
            </Modal>
          )}
          {openConfirmPersonalDeleteModal && (
            <Modal enforceFocus size='sm' backdrop show={openConfirmPersonalDeleteModal} onHide={this.handleDeleteFromPersonalModal} style={{ marginTop: '150px' }}>
              <Modal.Header>
                <Modal.Title style={{ textAlign: 'center', fontSize: '24px' }}>Confirm Submit</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <span style={{ textAlign: 'center', display: 'block', fontWeight: '600' }}>Are you sure you want to delete this request?</span>
                <Table showHeader={false} height={confirmPersonalDeleteData.length * 50} bordered={false} data={confirmPersonalDeleteData} style={{ margin: '20px 50px' }}>
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
                    <Button onClick={this.handleDeleteFromPersonalModal} style={{ width: '33%', fontSize: '16px' }} appearance='default'>
                      Cancel
                    </Button>
                    <Button onClick={this.handleSubmitPersonalDelete} style={{ width: '33%', fontSize: '16px' }} appearance='primary'>
                      Confirm
                    </Button>
                  </ButtonGroup>
                </ButtonToolbar>
              </Modal.Footer>
            </Modal>
          )}
          {openConfirmDeleteModal && (
            <Modal enforceFocus size='sm' backdrop show={openConfirmDeleteModal} onHide={this.handleDeleteFromAllModal} style={{ marginTop: '150px' }}>
              <Modal.Header>
                <Modal.Title style={{ textAlign: 'center', fontSize: '24px' }}>Confirm Submit</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <span style={{ textAlign: 'center', display: 'block', fontWeight: '600' }}>Are you sure you want to delete this request?</span>
                <Table showHeader={false} height={confirmDeleteData.length * 50} bordered={false} data={confirmDeleteData} style={{ margin: '20px 50px' }}>
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
                    <Button onClick={this.handleDeleteFromAllModal} style={{ width: '33%', fontSize: '16px' }} appearance='default'>
                      Cancel
                    </Button>
                    <Button onClick={this.handleSubmitDelete} style={{ width: '33%', fontSize: '16px' }} appearance='primary'>
                      Confirm
                    </Button>
                  </ButtonGroup>
                </ButtonToolbar>
              </Modal.Footer>
            </Modal>
          )}
          {openPersonalEditModal && (
            <EditModal
              open={openPersonalEditModal}
              data={personalEditData}
              rowData={personalRowData}
              gridApi={this.personalGridApi}
              setEditData={this.setPersonalEditData}
              toggleEditModal={this.togglePersonalEditModal}
              session={this.props.session}
              setRowData={this.setPersonalRowData}
            />
          )}
          {openAdminEditModal && (
            <EditModal
              open={openAdminEditModal}
              data={editData}
              rowData={allRowData}
              gridApi={this.allGridApi}
              setEditData={this.setEditData}
              toggleEditModal={this.toggleAdminEditModal}
              session={this.props.session}
              setRowData={this.setRowData}
            />
          )}
          <style jsx>{`
            @media screen and (max-width: 500px) {
              :global(.wrapper) {
                width: 100%;
              }
              :global(.settings-admin-container) {
                width: 80%;
              }
              :global(.settings-admin-row) {
                flex-direction: column;
              }
              :global(.settings-admin-col-2) {
                width: 100% !important;
              }
              :global(.settings-admin-col-1) {
                width: 100% !important;
              }
              :global(.person-panel-body .rs-panel-body) {
                padding: 20px !important;
              }
            }
            :global(.loading) {
              animation: rotating 1.5s linear infinite;
              @keyframes rotating {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            }
            :global(.rs-table-cell-group-fixed-right) {
              right: 80px !important;
              left: unset !important;
            }
            :global(.table-tab-list) {
              margin-bottom: 20px;
              padding-left: 0px !important;
            }
            :global(.reports-header) {
              padding-top: 10px;
              padding-left: 20px;
              padding-bottom: 20px;
            }
            :global(.rs-panel-default .rs-panel-body .rs-panel-default) {
              margin-top: 0px;
            }
            :global(.reports-panel) {
              padding: 10px;
            }
            :global(.reports-panel .rs-panel-body) {
              padding: 20px !important;
            }
            :global(.reports-panel .rs-panel) {
              margin-top: 20px;
            }
            :global(.reports-panel .rs-form-group) {
              margin: 10px;
            }
            :global(.reports-panel .rs-picker-select) {
              margin: 10px 0;
              width: 100%;
            }
            .reports-hr {
              width: 80%;
              margin: 0 auto;
            }
            :global(.table-tab-list .react-tabs__tab) {
              padding: 10px;
              transition: border 250ms ease-in-out;
            }
            :global(.react-tabs__tab--selected) {
              border: 1px solid #67B246 !important;
              color: #67b246 !important;
              border-radius: 10px !important;
            }
            :global(.react-tabs__tab:focus) {
              box-shadow: 0 0 5px #67B246;
              border-color: #67B246;
            }
            :global(.settings-admin-container > .rs-panel) {
              margin: 10px;
            }
            :global(.settings-admin-row) {
              display: flex;
              align-items: flex-start;
              justify-content: space-around;
            }
            :global(.settings-admin-col-1) {
               margin: 10px;
            }
            :global(.settings-admin-col-2) {
               display: inline-block;
               width: 50%;
               margin: 10px;
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
              margin-bottom: 20px;
            }
            :global(.rs-btn-ghost) {
              transition: box-shadow 250ms ease-in-out;
            }
            :global(.rs-btn-ghost:hover) {
              box-shadow: 0px 3px 5px rgba(0,0,0,0.15);
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
            :global(.person-grid) { 
              margin-bottom: 20px;
            }
            :global(.person-panel-body .rs-panel-body) {
              padding: 40px;
            }
            :global(.row-awaitingResponse) {
              background-color: transparent;
            }
            :global(.section-header) {
              font-size: 1.3rem;
              display: flex;
              margin-bottom: 20px;
            }
            :global(.rs-table) {
              max-width: 100%;
            }
            :global(.manager-btn) {
              line-height: 1.0;
              padding-top: 7px !important;
              transition: box-shadow 250ms ease-in-out;
            }
            :global(.manager-btn:hover) {
              box-shadow: 0 2px 0 rgba(247, 130, 130,.11), 0 4px 8px rgba(247, 130, 130,.12), 0 10px 10px rgba(247, 130, 130,.06), 0 7px 70px rgba(247, 130, 130,.1);
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
