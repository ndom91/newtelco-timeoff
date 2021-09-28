import React from "react"
import Layout from "../components/layout/index"
import Moment from "moment-timezone"
import { getSession } from "next-auth/react"
import RequireLogin from "../components/requiredLogin"
import Subheader from "../components/content-subheader"
import DateTimeField from "../components/aggrid/datetime"
import DateField from "../components/aggrid/date"
import Uppercase from "../components/aggrid/uppercase"
import ApprovedField from "../components/aggrid/approved"
import ViewFiles from "../components/aggrid/viewfiles"
import TypeField from "../components/aggrid/type"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/dist/styles/ag-grid.css"
import "ag-grid-community/dist/styles/ag-theme-material.css"
import { extendMoment } from "moment-range"
import EditModal from "../components/editRequestModal"
import DeleteModal from "../components/deleteRequestModal"
import { notifyInfo } from "../lib/notify"
import { format, isSameISOWeek } from "date-fns"
import {
  Badge,
  Container,
  Header,
  Content,
  ButtonToolbar,
  IconButton,
  ButtonGroup,
  Button,
  Panel,
  Icon,
  Modal,
  SelectPicker,
  Calendar,
} from "rsuite"

const moment = extendMoment(Moment)

class User extends React.Component {
  static async getInitialProps({ req, query }) {
    return {
      session: await getSession({ req }),
      view: query.ho === "true" ? "homeoffice" : "vacations",
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      rowData: [],
      files: [],
      uploadedFiles: [],
      homeofficeData: [],
      loadingFiles: false,
      openConfirmDeleteModal: false,
      gridType: "vacation",
      openEditModal: false,
      editAvailable: false,
      viewFilesModal: false,
      view: props.view ?? "vacations",
      editData: {
        from: "",
        to: "",
        lastYear: "",
        thisYear: "",
        spent: "",
        total: "",
        requested: "",
        remaining: "",
        id: "",
        note: "",
        approved: "",
        type: "",
      },
      gridOptions: {
        defaultColDef: {
          resizable: true,
          sortable: true,
          filter: true,
          selectable: false,
          editable: false,
        },
        columnDefs: [
          {
            headerName: "ID",
            field: "id",
            hide: true,
            sort: "desc",
          },
          {
            headerName: "Submitted",
            cellRenderer: "dateTimeShort",
            field: "submitted_datetime",
            width: 160,
          },
          {
            headerName: "Type",
            field: "type",
            cellRenderer: "uppercase",
            width: 100,
          },
          {
            headerName: "From",
            field: "fromDate",
            tooltipField: "fromDate",
            cellRenderer: "dateShort",
            width: 100,
          },
          {
            headerName: "To",
            field: "toDate",
            tooltipField: "toDate",
            cellRenderer: "dateShort",
            width: 100,
          },
          {
            headerName: "Days from Last Year",
            field: "resturlaubVorjahr",
            cellStyle: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            },
            width: 180,
          },
          {
            headerName: "Days Earned this Year",
            field: "jahresurlaubInsgesamt",
            tooltipField: "jahresurlaubInsgesamt",
            cellStyle: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            },
          },
          {
            headerName: "Days spent this Year",
            field: "jahresUrlaubAusgegeben",
            tooltipField: "jahresUrlaubAusgegeben",
            cellStyle: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            },
          },
          {
            headerName: "Total Days Available",
            field: "restjahresurlaubInsgesamt",
            width: 160,
            cellStyle: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            },
          },
          {
            headerName: "Requested Days",
            field: "beantragt",
            cellStyle: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            },
            width: 160,
          },
          {
            headerName: `Days Remaining`,
            field: "resturlaubJAHR",
            cellStyle: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            },
            width: 180,
          },
          {
            headerName: "Notes",
            field: "note",
            width: 160,
          },
          {
            headerName: "Manager",
            field: "manager",
            width: 160,
          },
          {
            headerName: "Approval Date/Time",
            field: "approval_datetime",
            cellRenderer: "dateTimeShort",
            width: 160,
          },
          {
            headerName: "Submitted By",
            field: "submitted_by",
            width: 140,
          },
          {
            headerName: "View Files",
            width: 160,
            cellRenderer: "viewfiles",
            cellRendererParams: {
              viewFiles: this.toggleViewFilesModal,
            },
            cellStyle: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              border: "none",
            },
          },
          {
            headerName: "Approved",
            field: "approved",
            width: 120,
            cellRenderer: "approved",
            pinned: "right",
            cellStyle: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            },
          },
        ],
        context: { componentParent: this },
        frameworkComponents: {
          dateTimeShort: DateTimeField,
          dateShort: DateField,
          approved: ApprovedField,
          uppercase: Uppercase,
          type: TypeField,
          viewfiles: ViewFiles,
        },
        rowSelection: "multiple",
        paginationPageSize: 10,
        rowClass: "row-class",
        rowClassRules: {
          "row-awaitingResponse": function (params) {
            const approved = params.data.approved
            if (approved !== "2") {
              return true
            }
            return false
          },
        },
      },
    }
  }

  async componentDidMount() {
    const host = window.location.host
    const protocol = window.location.protocol
    const user = this.props.session.user.email
    const vacaRes = await fetch(
      `${protocol}//${host}/api/user/entries?user=${user}&t=vacation`
    )
    const vacaData = await vacaRes.json()
    if (vacaData.userEntries) {
      this.setState({
        rowData: vacaData.userEntries,
      })
      window.gridApi && window.gridApi.refreshCells()
    }

    const homeofficeRes = await fetch(
      `${protocol}//${host}/api/homeoffice?uid=${user}`
    )
    const homeofficeData = await homeofficeRes.json()
    this.setState({
      homeofficeData,
    })
  }

  componentDidUpdate = () => {
    const type = this.state.gridType
    if (this.gridColumnApi) {
      const sickHideColumns = [
        "resturlaubVorjahr",
        "jahresurlaubInsgesamt",
        "jahresUrlaubAusgegeben",
        "restjahresurlaubInsgesamt",
        "beantragt",
        "resturlaubJAHR",
        "approved",
        "approval_datetime",
      ]
      if (type === "sick") {
        sickHideColumns.forEach((column) => {
          this.gridColumnApi.setColumnVisible(column, false)
        })
      } else {
        sickHideColumns.forEach((column) => {
          this.gridColumnApi.setColumnVisible(column, true)
        })
      }
    }
  }

  homeofficeCalendarCell = (date) => {
    return this.state.homeofficeData.map((week) => {
      if (isSameISOWeek(new Date(week.weekTo), new Date(date))) {
        const days = JSON.parse(week.days)
        const dayVal = days[format(new Date(date), "EEE").toLowerCase()]
        if (dayVal) {
          return (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#67B246"
                style={{ opacity: week.approved === 0 ? "0.5" : "1.0" }}
                width="32"
                height="32"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {week.approved === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    position: "absolute",
                    transform: "translate(-5px,-5px)",
                  }}
                  width="18"
                  height="18"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <div />
              )}
            </>
          )
        } else if (typeof dayVal !== "undefined") {
          return (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#CCC"
                style={{ opacity: week.approved === 0 ? "0.5" : "1.0" }}
                width="32"
                height="32"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {week.approved === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    position: "absolute",
                    transform: "translate(-5px,-5px)",
                  }}
                  width="18"
                  height="18"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <div />
              )}
            </>
          )
        }
      }
    })
  }

  setEditData = (files, data) => {
    if (!data) {
      this.setState({
        files: files,
      })
    } else {
      this.setState({
        editData: data,
        files: files,
      })
    }
  }

  setRowData = (data) => {
    this.setState({
      rowData: data,
    })
  }

  handleGridReady = (params) => {
    this.gridApi = params.api
    window.gridApi = params.api
    this.gridColumnApi = params.columnApi
  }

  onFirstDataRendered = (params) => {
    params.columnApi.autoSizeColumns()
  }

  handleGridExport = () => {
    if (this.gridApi) {
      const email = this.props.session.user.email
      const username = email.substr(0, email.lastIndexOf("@"))
      const params = {
        allColumns: true,
        fileName: `${username}_timeoff_${moment(new Date()).format(
          "YYYYMMDD"
        )}.csv`,
        columnSeparator: ",",
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
      .then((res) => res.json())
      .then((data) => {
        if (data.userEntries) {
          this.setState({
            rowData: data.userEntries,
            gridType: type,
          })
          window.gridApi && window.gridApi.refreshCells()
        }
      })
      .catch((err) => console.error(err))
  }

  toggleConfirmDeleteModal = () => {
    if (this.state.openConfirmDeleteModal) {
      this.setState({
        openConfirmDeleteModal: !this.state.openConfirmDeleteModal,
      })
      return
    }
    if (this.gridApi) {
      const selectedRow = this.gridApi.getSelectedRows()
      if (!selectedRow[0]) {
        notifyInfo("Please select an entry to delete!")
        return
      }
      const request = selectedRow[0]
      const tableData = [
        {
          title: "From",
          value: request.fromDate,
        },
        {
          title: "To",
          value: request.toDate,
        },
        {
          title: "Manager",
          value: request.manager,
        },
        {
          title: "Type",
          value: request.type.charAt(0).toUpperCase() + request.type.slice(1),
        },
        {
          title: "Requested Days",
          value: request.beantragt,
        },
        {
          title: "Remaining Days",
          value: request.resturlaubJAHR,
        },
      ]
      this.setState({
        openConfirmDeleteModal: !this.state.openConfirmDeleteModal,
        confirmDeleteData: tableData,
        toDelete: request.id || 0,
      })
    }
  }

  toggleEditModal = () => {
    if (this.gridApi) {
      const host = window.location.host
      const protocol = window.location.protocol
      const selectedRow = this.gridApi.getSelectedRows()
      if (!selectedRow[0]) {
        notifyInfo("Please select a row to edit")
        return
      }
      const request = selectedRow[0]
      this.setState({
        loadingFiles: true,
        editAvailable: !request.approved == 0,
      })
      const rawFrom = request.fromDate.split(".")
      const rawTo = request.toDate.split(".")
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
        type:
          request.type &&
          request.type[0].toUpperCase() + request.type.substring(1),
      }
      fetch(`${protocol}//${host}/api/mail/file?id=${request.id}`)
        .then((data) => data.json())
        .then((data) => {
          let files = []
          if (data.files[0]?.files?.length !== 0) {
            files = JSON.parse(data.files[0].files)
          }
          this.setState({
            editData: tableData,
            files: files,
            loadingFiles: false,
            openEditModal: !this.state.openEditModal,
            editAvailable: this.state.editAvailable,
          })
        })
        .catch((err) => console.error(err))
    }
  }

  toggleViewFilesModal = (files) => {
    if (files === null) {
      this.setState({
        viewFilesModal: !this.state.viewFilesModal,
      })
    } else {
      const viewFiles = typeof files === "string" ? JSON.parse(files) : files
      console.log(viewFiles)
      this.setState({
        viewFilesModal: !this.state.viewFilesModal,
        viewFiles: viewFiles,
      })
    }
  }

  render() {
    const {
      gridOptions,
      rowData,
      openConfirmDeleteModal,
      confirmDeleteData,
      openEditModal,
      editData,
      viewFilesModal,
      viewFiles,
      view,
    } = this.state

    if (this.props.session) {
      return (
        <Layout
          user={this.props.session.user.email}
          token={this.props.session.csrfToken}
        >
          <Container>
            <Subheader header="User" subheader="Dashboard" />
            <Panel bordered>
              <Header className="user-content-header">
                <div className="section-header">
                  <ButtonGroup>
                    <Button
                      onClick={() => this.setState({ view: "vacations" })}
                      appearance={view === "vacations" ? "primary" : "ghost"}
                    >
                      Vacations
                    </Button>
                    <Button
                      onClick={() => this.setState({ view: "homeoffice" })}
                      appearance={view === "homeoffice" ? "primary" : "ghost"}
                    >
                      Homeoffice
                    </Button>
                  </ButtonGroup>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  {view === "vacations" ? (
                    <>
                      <SelectPicker
                        defaultValue="vacation"
                        onChange={this.handleTypeChange}
                        data={[
                          { label: "Vacation", value: "vacation" },
                          { label: "Sick", value: "sick" },
                          { label: "Trip", value: "trip" },
                          { label: "Moving", value: "moving" },
                          { label: "Other", value: "other" },
                        ]}
                        placeholder="Please Select a Type"
                        style={{ width: "200px", marginRight: "20px" }}
                      />
                      <ButtonToolbar>
                        <ButtonGroup>
                          <IconButton
                            icon={<Icon icon="edit" />}
                            appearance="primary"
                            onClick={this.toggleEditModal}
                          >
                            Edit
                          </IconButton>
                          <IconButton
                            icon={<Icon icon="trash" />}
                            appearance="ghost"
                            onClick={this.toggleConfirmDeleteModal}
                          >
                            Delete
                          </IconButton>
                          <IconButton
                            icon={<Icon icon="export" />}
                            appearance="ghost"
                            onClick={this.handleGridExport}
                          >
                            Export
                          </IconButton>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </>
                  ) : (
                    <ButtonToolbar>
                      <ButtonGroup>
                        <IconButton
                          icon={<Icon icon="export" />}
                          appearance="ghost"
                          onClick={this.handleHomeofficeGridExport}
                        >
                          Export
                        </IconButton>
                      </ButtonGroup>
                    </ButtonToolbar>
                  )}
                </div>
              </Header>
              <Content className="user-grid-wrapper">
                <div className="ag-theme-material user-grid">
                  {view === "vacations" ? (
                    <AgGridReact
                      gridOptions={gridOptions}
                      rowData={rowData}
                      onGridReady={this.handleGridReady}
                      animateRows
                      pagination
                      onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                    />
                  ) : (
                    <Calendar
                      bordered
                      renderCell={this.homeofficeCalendarCell}
                    />
                  )}
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
                fieldsDisabled={this.state.editAvailable}
              />
            )}
            {viewFilesModal && (
              <Modal
                show={viewFilesModal}
                onHide={() => this.toggleViewFilesModal(null)}
              >
                <Modal.Header>
                  <Modal.Title>View Files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <ul className="view-file-list">
                    {viewFiles &&
                      viewFiles.map((file, index) => {
                        return (
                          <li className="view-file-list-item" key={index}>
                            <div className="view-file-item">
                              {file.name ? (
                                file.name.includes("pdf") ? (
                                  <>
                                    <Icon
                                      size="lg"
                                      style={{ marginRight: "10px" }}
                                      icon="file-pdf-o"
                                    />
                                    <a
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="view-file-link"
                                      title={file.name}
                                      href={file.url}
                                    >
                                      {file.name}
                                    </a>
                                  </>
                                ) : ["png", "jpg", "bmp", "gif"].includes(
                                    file.format
                                  ) ? (
                                  <>
                                    <Icon
                                      size="lg"
                                      style={{ marginRight: "10px" }}
                                      icon="file-image-o"
                                    />
                                    <a
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="view-file-link"
                                      title={file.name}
                                      href={file.url}
                                    >
                                      {file.name}
                                    </a>
                                  </>
                                ) : (
                                  <>
                                    <Icon
                                      size="lg"
                                      style={{ marginRight: "10px" }}
                                      icon="file-o"
                                    />
                                    <a
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="view-file-link"
                                      title={file.name}
                                      href={file.url}
                                    >
                                      {file.name}
                                    </a>
                                  </>
                                )
                              ) : file.format === "pdf" ? (
                                <>
                                  <Icon
                                    size="lg"
                                    style={{ marginRight: "10px" }}
                                    icon="file-pdf-o"
                                  />
                                  <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-file-link"
                                    title={file.name}
                                    href={file.url}
                                  >
                                    {file.name}.{file.format}
                                  </a>
                                </>
                              ) : ["png", "jpg", "bmp", "gif"].includes(
                                  file.format
                                ) ? (
                                <>
                                  <Icon
                                    size="lg"
                                    style={{ marginRight: "10px" }}
                                    icon="file-image-o"
                                  />
                                  <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-file-link"
                                    title={file.name}
                                    href={file.url}
                                  >
                                    {file.name}.{file.format}
                                  </a>
                                </>
                              ) : (
                                <>
                                  <Icon
                                    size="lg"
                                    style={{ marginRight: "10px" }}
                                    icon="file-o"
                                  />
                                  <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-file-link"
                                    title={file.name}
                                    href={file.url}
                                  >
                                    {file.name}.{file.format}
                                  </a>
                                  )
                                </>
                              )}
                            </div>
                          </li>
                        )
                      })}
                  </ul>
                </Modal.Body>
              </Modal>
            )}
          </Container>
          <style jsx>
            {`
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
                height: 95%;
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
                margin-left: 10px;
                max-width: 320px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
              }
              .view-file-link::before {
                content: "";
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
                box-shadow: 0 2px 0 rgba(90, 97, 105, 0.11),
                  0 4px 8px rgba(90, 97, 105, 0.02),
                  0 10px 10px rgba(90, 97, 105, 0.06),
                  0 7px 70px rgba(90, 97, 105, 0.1);
                margin: 5px 10px;
              }
              .edit-file-item:hover {
                text-decoration: none;
                cursor: pointer;
                transition: all 250ms ease-in-out;
                box-shadow: 0 2px 0 rgba(90, 97, 105, 0.11),
                  0 4px 8px rgba(90, 97, 105, 0.12),
                  0 10px 10px rgba(90, 97, 105, 0.16),
                  0 7px 70px rgba(90, 97, 105, 0.1);
              }
              :global(.section-header) {
                font-size: 1.3rem;
              }
              :global(.ag-cell-label-container) {
                width: 110%;
              }
              :global(.tag-wrapper) {
                box-shadow: 0 2px 0 rgba(90, 97, 105, 0.11),
                  0 4px 8px rgba(90, 97, 105, 0.12),
                  0 10px 10px rgba(90, 97, 105, 0.16),
                  0 7px 70px rgba(90, 97, 105, 0.1);
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

export default User
