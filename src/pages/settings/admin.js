import React from 'react'
import fetch from 'isomorphic-unfetch'
import Layout from '../../components/layout/index'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../../components/requiredLogin'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import DateField from '../../components/aggrid/date'
import {
  Container,
  Header,
  Content,
  Button,
  Modal,
  Alert,
  Panel
} from 'rsuite'

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
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:'
    const pageRequest = `${protocol}//${host}/api/user/list`
    const userRequest = await fetch(pageRequest)
    const userJson = await userRequest.json()
    return {
      session: await NextAuth.init({ req }),
      // users: userJson === undefined ? [] : userJson
      users: userJson
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      addCount: 0,
      updateCount: 0,
      showSyncModal: false,
      // users: props.userJson === undefined ? [] : props.userJson,
      // rowData: props.users,
      rowData: props.users.userList,
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
            headerName: 'First Name',
            field: 'fname',
            width: 120
          }, {
            headerName: 'Last Name',
            field: 'lname',
            width: 120
          }, {
            headerName: 'Email',
            field: 'email'
          }, {
            headerName: 'Team',
            field: 'team',
            width: 120
          }, {
            headerName: 'Date Joined',
            field: 'datejoined',
            cellRenderer: 'dateShort'
          }, {
            headerName: 'Days Remaining',
            field: 'daysremaining'
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
      fetch(adRequestUrl, {
        // method: 'POST',
        // body: JSON.stringify({ u: JSON.stringify(adUsers) }),
        // headers: {
        //   'Access-Control-Allow-Origin': '*',
        //   'Content-Type': 'application/json',
        //   _csrf: this.props.session.csrfToken
        // }
      })
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

  onFirstDataRendered = params => {
    // params.api.sizeColumnsToFit()
  }

  render () {
    const {
      gridOptions,
      rowData,
      showSyncModal,
      addCount,
      updateCount
    } = this.state

    if (this.props.session.user) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <Container>
            <Panel bordered>
              <Header className='user-content-header'>
                <span className='section-header'>
                  Users
                </span>
                <Button onClick={this.handleAdGroupSync}>Sync AD Groups</Button>
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
          <style jsx>{`
            :global(.user-content-header) {
              display: flex;
              width: 100%;
              justify-content: space-between;
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
