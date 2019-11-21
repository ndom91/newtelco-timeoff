import React from 'react'
import Layout from '../components/layout/index'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import moment from 'moment-timezone'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
import DateTimeField from '../components/aggrid/datetime'
import DateField from '../components/aggrid/date'
import ApprovedField from '../components/aggrid/approved'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import {
  Container,
  Header,
  Content,
  Button,
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
    return {
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)
    const lastYear = new Date().getFullYear() - 1
    const thisYear = new Date().getFullYear()

    // approval_datetime: null
    // approval_hash: null
    // approved: 2
    // beantragt: 1
    // email: "ndomino@newtelco.de"
    // fromDate: "2018-11-14T23:00:00.000Z"
    // id: 14
    // jahresurlaubInsgesamt: 17.5
    // manager: "nhartmann@newtelco.de"
    // name: "Nico Domino"
    // note: null
    // restjahresurlaubInsgesamt: 17.5
    // resturlaubJAHR: 16.5
    // resturlaubVorjahr: 0
    // submitted_by: "ndomino"
    // submitted_datetime: "2018-10-24T11:32:17.000Z"
    // toDate: "2018-11-14T23:00:00.000Z"

    this.state = {
      rowData: [],
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
            headerName: `Days Remaining ${lastYear}`,
            field: 'resturlaubVorjahr',
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }, {
            headerName: `Days Remaining ${thisYear}`,
            field: 'resturlaubJAHR',
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }, {
            headerName: 'Days Remaining (Total)',
            field: 'jahresurlaubInsgesamt',
            tooltipField: 'jahresurlaubInsgesamt',
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
            }
          }, {
            headerName: 'Days Remaining',
            field: 'restjahresurlaubInsgesamt',
            width: 160,
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }
          }, {
            headerName: 'From',
            field: 'fromDate',
            tooltipField: 'fromDate',
            cellRenderer: 'dateShort',
            width: 150
          }, {
            headerName: 'To',
            field: 'toDate',
            tooltipField: 'toDate',
            cellRenderer: 'dateShort',
            width: 150
          }, {
            headerName: 'Submitted',
            cellRenderer: 'dateTimeShort',
            field: 'submitted_datetime',
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

  componentDidMount () {
    const host = window.location.host
    const user = this.props.session.user.email
    fetch(`http://${host}/api/user/entries?user=${user}`)
      .then(res => res.json())
      .then(data => {
        if (data.userEntries) {
          this.setState({
            rowData: data.userEntries
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

  handleGridExport () {
    if (this.gridApi) {
      const params = {
        allColumns: true,
        fileName: `userTimeoff_${moment(new Date()).format('YYYYMMDD')}`,
        columnSeparator: ','
      }
      this.gridApi.exportDataAsCsv(params)
    }
  }

  render () {
    const {
      gridOptions,
      rowData
    } = this.state

    if (this.props.session.user) {
      return (
        <Layout>
          <Container>
            <Panel bordered>
              <Header className='user-content-header'>
                <span className='section-header'>
                  My Vacations
                </span>
                <Button>
                  Export
                </Button>
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
