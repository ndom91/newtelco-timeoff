import React from "react"
import Layout from "../../components/layout/index"
import { parseISO } from "date-fns"
import moment from "moment-timezone"
import { getSession } from "next-auth/react"
import RequireLogin from "../../components/requiredLogin"
import Subheader from "../../components/content-subheader"
import "react-tabs/style/react-tabs.css"
import {
  Container,
  Header,
  IconButton,
  Icon,
  Panel,
  SelectPicker,
  FormGroup,
  ControlLabel,
  Row,
  Col,
} from "rsuite"

const StackedBarChart = React.lazy(() =>
  import("../../components/stackedBarChart")
)
const AreaChart = React.lazy(() => import("../../components/lineChart"))

class AdminReports extends React.Component {
  static async getInitialProps({ req, query }) {
    return {
      session: await getSession({ req }),
      admin: query.admin,
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      allMonths: [],
      allYears: [],
      admin: props.admin,
    }
  }

  componentDidMount() {
    const allYears = []
    const yearNow = moment().format("YYYY")
    for (let i = 0; i < 3; i++) {
      const yearNowLoop = yearNow - i
      allYears.push({ value: yearNowLoop, label: yearNowLoop })
    }
    const allMonths = []
    const monthNow = moment()
    for (let i = 0; i < 12; i++) {
      const monthNowLoop = moment(monthNow)
        .subtract(i, "months")
        .format("MMMM YYYY")
      allMonths.push({ value: monthNowLoop, label: monthNowLoop })
    }

    this.setState({
      allMonths,
      allYears,
    })
  }

  homeofficeExport = async () => {
    const homeofficeRes = await fetch("/api/homeoffice")
    const homeofficeData = await homeofficeRes.json()
    let csvContent = "data:text/csv;charset=utf-8,"

    const rows = homeofficeData.reduce((rows, week) => {
      const days = JSON.parse(week.days)
      rows.push({
        name: week.name,
        manager: week.manager,
        from: week.weekFrom,
        to: week.weekTo,
        mon: days.mon,
        tue: days.tue,
        wed: days.wed,
        thu: days.thu,
        fri: days.fri,
        note: week.note,
        submittedOn: week.submittedDatetime,
      })
      return rows
    }, [])

    // Get CSV Headers
    csvContent += Object.keys(rows[0]).join(",") + "\r\n"

    rows.forEach((rowArray) => {
      let row = Object.values(rowArray).join(",")
      csvContent += row + "\r\n"
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `newtelco-homeoffice-requests.csv`)
    document.body.appendChild(link)
    link.click()
  }

  homeofficeMonthExport = async () => {
    const { month, year } = this.state.reportSelection.month
    const homeofficeRes = await fetch(
      `/api/homeoffice?month=${month}&year=${year}`
    )
    const homeofficeData = await homeofficeRes.json()
    let csvContent = "data:text/csv;charset=utf-8,"

    const rows = homeofficeData.reduce((rows, week) => {
      const days = JSON.parse(week.days)
      rows.push({
        name: week.name,
        manager: week.manager,
        from: parseISO(week.weekFrom),
        to: parseISO(week.weekTo),
        mon: days.mon,
        tue: days.tue,
        wed: days.wed,
        thu: days.thu,
        fri: days.fri,
        note: week.note,
        submittedOn: week.submittedDatetime,
      })
      return rows
    }, [])

    // Get CSV Headers
    csvContent += Object.keys(rows[0]).join(",") + "\r\n"

    rows.forEach((rowArray) => {
      let row = Object.values(rowArray).join(",")
      csvContent += row + "\r\n"
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `newtelco-homeoffice-${month}${year}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  convertToCSV = (objArray) => {
    const array = typeof objArray !== "object" ? JSON.parse(objArray) : objArray
    let str = ""

    for (let i = 0; i < array.length; i++) {
      let line = ""
      for (const index in array[i]) {
        if (line !== "") line += '";"'
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
    const exportedFilenmae = fileTitle + ".csv" || "export.csv"
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, exportedFilenmae)
    } else {
      const link = document.createElement("a")
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", exportedFilenmae)
        link.style.visibility = "hidden"
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
      .then((resp) => resp.json())
      .then((data) => {
        const exportData = []
        data.query.forEach((data) => {
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
            from: moment(data.fromDate).format("DD.MM.YYYY"),
            to: moment(data.toDate).format("DD.MM.YYYY"),
            manager: data.manager,
            note: data.note,
            submitted: moment(data.submitted_datetime).format(
              "DD.MM.YYYY HH:mm"
            ),
            submittedBy: data.submitted_by,
            approvedDateTime: moment(data.approval_datetime).format(
              "DD.MM.YYYY HH:mm"
            ),
          })
        })
        const headers = {
          id: "ID",
          name: "Name",
          email: "Email",
          lastYear: "Last Year",
          thisYear: "This Year",
          spent: "Spent this Year",
          total: "Total Available",
          requested: "Requested",
          remaining: "Remaining",
          type: "Type",
          from: "From",
          to: "To",
          manager: "Manager",
          note: "Note",
          submitted: "Submitted",
          submittedBy: "Submmitted By",
          approvedDateTime: "Approved Date/Time",
        }
        this.exportCSVFile(
          headers,
          exportData,
          `${date.month}${date.year}_vacation_export`
        )
      })
  }

  handleMonthReportSelectChange = (selection) => {
    const monthName = selection.split(" ")[0]
    const year = selection.split(" ")[1]
    const month = {
      month: moment().month(monthName).format("MM"),
      year: year,
    }
    this.setState({
      reportSelection: {
        ...this.state.reportSelection,
        month: month,
      },
    })
  }

  handleYearReportExport = () => {
    const host = window.location.host
    const protocol = window.location.protocol
    const year = this.state.reportSelection.year
    fetch(`${protocol}//${host}/api/report/year?y=${year}`)
      .then((resp) => resp.json())
      .then((data) => {
        const exportData = []
        data.query.forEach((data) => {
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
            from: moment(data.fromDate).format("DD.MM.YYYY"),
            to: moment(data.toDate).format("DD.MM.YYYY"),
            manager: data.manager,
            note: data.note,
            submitted: moment(data.submitted_datetime).format(
              "DD.MM.YYYY HH:mm"
            ),
            submittedBy: data.submitted_by,
            approvedDateTime: moment(data.approval_datetime).format(
              "DD.MM.YYYY HH:mm"
            ),
          })
        })
        const headers = {
          id: "ID",
          name: "Name",
          email: "Email",
          lastYear: "Last Year",
          thisYear: "This Year",
          spent: "Spent this Year",
          total: "Total Available",
          requested: "Requested",
          remaining: "Remaining",
          type: "Type",
          from: "From",
          to: "To",
          manager: "Manager",
          note: "Note",
          submitted: "Submitted",
          submittedBy: "Submmitted By",
          approvedDateTime: "Approved Date/Time",
        }
        this.exportCSVFile(headers, exportData, `${year}_vacation_export`)
      })
  }

  handleYearReportSelectChange = (selection) => {
    this.setState({
      reportSelection: {
        ...this.state.reportSelection,
        year: selection,
      },
    })
  }

  handleYearTDReportExport = () => {
    const host = window.location.host
    const protocol = window.location.protocol
    const year = this.state.reportSelection.ytd
    fetch(`${protocol}//${host}/api/report/ytd?y=${year}`)
      .then((resp) => resp.json())
      .then((data) => {
        const exportData = []
        data.query.forEach((data) => {
          exportData.push({
            id: data.id,
            name: data.name,
            email: data.email,
            remaining: data.resturlaubJAHR,
            submitted: moment(data.submitted_datetime).format(
              "DD.MM.YYYY HH:mm"
            ),
          })
        })
        const headers = {
          id: "ID",
          name: "Name",
          email: "Email",
          remaining: `Remaining from ${year}`,
          submitted: "Submitted On",
        }
        this.exportCSVFile(headers, exportData, `${year}_daysLeftOver_export`)
      })
  }

  handleYearTDReportSelectChange = (selection) => {
    this.setState({
      reportSelection: {
        ...this.state.reportSelection,
        ytd: selection,
      },
    })
  }

  render() {
    let userAdmin = false
    if (typeof window !== "undefined") {
      userAdmin = JSON.parse(window.localStorage.getItem("mA"))
    }
    const { allMonths, allYears } = this.state

    if (this.props.session && userAdmin) {
      return (
        <Layout
          user={this.props.session.user.email}
          token={this.props.session.csrfToken}
        >
          <Container className="settings-admin-container">
            <Subheader header="Administration" subheader="Reports" />
            <Row style={{ display: "flex", justifyContent: "space-between" }}>
              <Col className="settings-admin-col-2">
                <Panel bordered className="person-panel-body">
                  <Header
                    style={{ marginBottom: "20px" }}
                    className="user-content-header"
                  >
                    <h4>Last Year - Bar Chart</h4>
                  </Header>
                  <Panel bordered style={{ boxShadow: "none" }}>
                    <div style={{ height: "300px", width: "100%" }}>
                      <React.Suspense fallback={<div />}>
                        <StackedBarChart />
                      </React.Suspense>
                    </div>
                  </Panel>
                </Panel>
              </Col>
              <Col className="settings-admin-col-2">
                <Panel bordered className="person-panel-body">
                  <Header
                    style={{ marginBottom: "20px" }}
                    className="user-content-header"
                  >
                    <h4>Last Year - Area Chart</h4>
                  </Header>
                  <Panel bordered style={{ boxShadow: "none" }}>
                    <div style={{ height: "300px", width: "100%" }}>
                      <React.Suspense fallback={<div />}>
                        <AreaChart />
                      </React.Suspense>
                    </div>
                  </Panel>
                </Panel>
              </Col>
            </Row>
            <Row className="settings-admin-row">
              <Col className="settings-admin-col-1">
                <Panel bordered className="person-panel-body reports-panel">
                  <Header style={{ marginBottom: "20px" }}>
                    <h4>Reports</h4>
                  </Header>
                  <Panel
                    className="reports-panel-body"
                    bordered
                    style={{ boxShadow: "none" }}
                  >
                    <Panel style={{ boxShadow: "none" }}>
                      <FormGroup>
                        <ControlLabel>All Homeoffice</ControlLabel>
                        <IconButton
                          block
                          icon={<Icon icon="export" />}
                          appearance="ghost"
                          onClick={this.homeofficeExport}
                          style={{ marginTop: "30px" }}
                        >
                          Export CSV
                        </IconButton>
                      </FormGroup>
                    </Panel>
                    <hr className="reports-hr" />
                    <Panel style={{ boxShadow: "none" }}>
                      <FormGroup>
                        <ControlLabel>Monthly Homeoffice</ControlLabel>
                        <SelectPicker
                          onChange={this.handleMonthReportSelectChange}
                          data={allMonths}
                          placeholder="Please Select a month"
                          placement="topStart"
                        />
                        <IconButton
                          block
                          icon={<Icon icon="export" />}
                          appearance="ghost"
                          onClick={this.homeofficeMonthExport}
                          style={{ marginTop: "30px" }}
                        >
                          Export CSV
                        </IconButton>
                      </FormGroup>
                    </Panel>
                    <hr className="reports-hr" />
                    <Panel style={{ boxShadow: "none" }}>
                      <FormGroup>
                        <ControlLabel>Monthly Absence</ControlLabel>
                        <SelectPicker
                          onChange={this.handleMonthReportSelectChange}
                          data={allMonths}
                          placeholder="Please Select a month"
                          placement="topStart"
                        />
                        <IconButton
                          block
                          icon={<Icon icon="export" />}
                          appearance="ghost"
                          onClick={this.handleMonthReportExport}
                        >
                          Export CSV
                        </IconButton>
                      </FormGroup>
                    </Panel>
                    <hr className="reports-hr" />
                    <Panel style={{ boxShadow: "none" }}>
                      <FormGroup>
                        <ControlLabel>Yearly Absence</ControlLabel>
                        <SelectPicker
                          onChange={this.handleYearReportSelectChange}
                          data={allYears}
                          placeholder="Please select a year"
                          searchable={false}
                          placement="topStart"
                        />
                        <IconButton
                          block
                          icon={<Icon icon="export" />}
                          appearance="ghost"
                          onClick={this.handleYearReportExport}
                        >
                          Export CSV
                        </IconButton>
                      </FormGroup>
                    </Panel>
                    <hr className="reports-hr" />
                    <Panel style={{ boxShadow: "none" }}>
                      <FormGroup>
                        <ControlLabel>Year-end Remaining Absences</ControlLabel>
                        <SelectPicker
                          onChange={this.handleYearTDReportSelectChange}
                          data={allYears}
                          placeholder="Please select a year"
                          searchable={false}
                          placement="topStart"
                        />
                        <IconButton
                          block
                          icon={<Icon icon="export" />}
                          appearance="ghost"
                          onClick={this.handleYearTDReportExport}
                        >
                          Export CSV
                        </IconButton>
                      </FormGroup>
                    </Panel>
                  </Panel>
                </Panel>
              </Col>
            </Row>
          </Container>
          <style jsx>
            {`
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
                  width: 100%;
                }
                :global(.settings-admin-col-1) {
                  width: 100%;
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
              :global(.rs-row) {
                padding: 10px;
              }
              :global(.rs-col) {
                padding: 10px;
              }
              :global(.table-tab-list) {
                margin-bottom: 20px;
                padding-left: 0px !important;
              }
              :global(.reports-panel-body > .rs-panel-body) {
                display: flex;
              }
              :global(.reports-panel-body .rs-form-group) {
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .reports-hr {
                height: 100px;
                width: 2px;
                margin: auto;
                border-left: 1px solid #eaeaea;
              }
              :global(.rs-form-group > *) {
                margin: 5px;
              }
              :global(.table-tab-list .react-tabs__tab) {
                padding: 10px;
                transition: border 250ms ease-in-out;
              }
              :global(.react-tabs__tab--selected) {
                border: 1px solid #67b246 !important;
                color: #67b246 !important;
                border-radius: 10px !important;
              }
              :global(.react-tabs__tab:focus) {
                box-shadow: 0 0 5px #67b246;
                border-color: #67b246;
              }
              :global(.settings-admin-container > .rs-panel) {
                margin: 10px;
              }
              :global(.settings-admin-row) {
                display: flex;
                align-items: flex-start;
                justify-content: space-around;
              }
              :global(.settings-admin-col-2) {
                flex: 2;
              }
              :global(.settings-admin-col-1) {
                flex: 1;
              }
              :global(.rs-btn-ghost) {
                transition: box-shadow 250ms ease-in-out;
              }
              :global(.rs-btn-ghost:hover) {
                box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.15);
              }
              :global(.user-content-header:focus) {
                outline: none;
              }
              :global(.person-grid) {
                margin-bottom: 20px;
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
                line-height: 1;
                padding-top: 7px !important;
                transition: box-shadow 250ms ease-in-out;
              }
              :global(.manager-btn:hover) {
                box-shadow: 0 2px 0 rgba(247, 130, 130, 0.11),
                  0 4px 8px rgba(247, 130, 130, 0.12),
                  0 10px 10px rgba(247, 130, 130, 0.06),
                  0 7px 70px rgba(247, 130, 130, 0.1);
              }
            `}
          </style>
        </Layout>
      )
    } else {
      return (
        <Layout
          user={this.props.session.user.email}
          token={this.props.session.csrfToken}
        >
          <RequireLogin />
        </Layout>
      )
    }
  }
}

export default AdminReports
