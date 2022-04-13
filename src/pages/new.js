import React from "react"
import { getSession, getCsrfToken } from "next-auth/react"
import uuid from "v4-uuid"
import moment from "moment"
import Lottie from "react-lottie"
import { format } from "date-fns"
import { CSSTransition } from "react-transition-group"
import Joyride, { STATUS } from "react-joyride"

import Layout from "../components/layout/index"
import RequireLogin from "../components/requiredLogin"
import Subheader from "../components/content-subheader"
import Calculator from "../components/newcalculator"
import Upload from "../components/upload"
import HomeOffice from "../components/new/homeoffice"
import lottieSuccess from "../style/lottie-success.json"
import lottieError from "../style/error-icon.json"

import { notifyWarn, notifyError, notifyInfo } from "../lib/notify"

import {
  Container,
  Content,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  DateRangePicker,
  Input,
  InputNumber,
  Button,
  Radio,
  RadioGroup,
  Panel,
  ButtonToolbar,
  ButtonGroup,
  SelectPicker,
  Modal,
  Table,
  Animation,
  Tooltip,
  Whisper,
  Checkbox,
  CheckboxGroup,
} from "rsuite"

const { Slide } = Animation
const { Column, HeaderCell, Cell } = Table

class New extends React.Component {
  static async getInitialProps({ req }) {
    return {
      session: await getSession({ req }),
      csrfToken: await getCsrfToken({ req }),
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      openConfirmModal: false,
      confirmed: false,
      confirmText: "",
      successfullySent: false,
      sendSuccess: false,
      calcSideBar: -30,
      uploading: false,
      loaded: 0,
      hideHistory: false,
      showCalc: false,
      joyrideRun: true,
      message: "Please click or drop file",
      tutorialComplete: false,
      uploadedFiles: [],
      availableUsers: [],
      disableDaysInput: false,
      vaca: {
        name: props.session.user.name,
        email: props.session.user.email,
        lastYear: 0,
        thisYear: 0,
        spentThisYear: 0,
        total: 0,
        requested: 0,
        remaining: 0,
        type: "vacation",
        dateFrom: "",
        dateTo: "",
        manager: "",
        notes: null,
        confirmIllness: [],
      },
      tutSteps: [
        {
          target: "#type-of-absence",
          content: "Select the appropriate type of absence for this request.",
        },
        {
          target: "#requested-days",
          content:
            "Next, enter how many days you would like off with this request.",
        },
        {
          target: "#which-days",
          content:
            "Finally, enter the day you are leaving and returning, select your manager, and press submit!",
        },
      ],
    }
  }

  componentDidMount() {
    const host = window.location.host
    const protocol = window.location.protocol
    const tutorial = window.localStorage.getItem("tut")
    const isMobile = window.innerWidth < 500
    if (isMobile) {
      this.setState({
        joyrideRun: false,
      })
    } else {
      if (tutorial === "true") {
        this.setState({
          joyrideRun: false,
        })
      }
    }
    fetch(`${protocol}//${host}/api/managers`)
      .then((res) => res.json())
      .then((data) => {
        const managerData = []
        data.managerEntries.forEach((m) => {
          managerData.push({ label: m.name, value: m.email })
        })
        this.setState({
          availableManagers: managerData,
        })
      })
      .catch((err) => console.error(err))

    fetch("/api/user/list")
      .then((res) => res.json())
      .then((data) => {
        const availableUsers = []
        data.userList.forEach((m) => {
          if (m.email === "device@newtelco.de") return
          if (m.email === "jcleese@newtelco.de") return
          if (m.email === "maintenance@newtelco.de") return
          if (m.email === "support@newtelco.de") return
          m.email &&
            availableUsers.push({
              label: `${m.fname} ${m.lname}`,
              value: m.email,
            })
        })
        this.setState({
          availableUsers,
        })
      })
      .catch((err) => console.error(err))

    const email = this.props.session.user.email
    fetch(`/api/user/entries/new?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        const lastRequest = data.newestEntry[0]
        if (lastRequest) {
          let existingData = this.state.vaca
          existingData = {
            ...existingData,
            lastYear: lastRequest.resturlaubVorjahr,
            thisYear: lastRequest.jahresurlaubInsgesamt,
            spentThisYear:
              parseFloat(lastRequest.jahresUrlaubAusgegeben || 0) +
              parseFloat(lastRequest.beantragt),
            total: lastRequest.resturlaubJAHR,
            remaining: lastRequest.resturlaubJAHR,
          }
          this.setState({
            vaca: existingData,
            disableDaysInput: true,
          })
        }
      })
      .catch((err) => console.error(err))
  }

  handleNameChange = (email) => {
    const user = this.state.availableUsers.find((u) => u.value === email)
    fetch(`/api/user/entries/new?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        const lastEntry = data.newestEntry[0]
        if (lastEntry) {
          const lastRequest = {
            ...lastEntry,
            lastYear: lastEntry.resturlaubVorjahr,
            thisYear: lastEntry.jahresurlaubInsgesamt,
            spentThisYear:
              parseFloat(lastEntry.jahresUrlaubAusgegeben || 0) +
              parseFloat(lastEntry.beantragt),
            total: lastEntry.resturlaubJAHR,
            requested: 0,
            remaining: lastEntry.resturlaubJAHR,
            name: user.label,
            email: email,
          }
          this.setState({
            vaca: lastRequest,
            disableDaysInput: true,
          })
        } else {
          this.setState({
            disableDaysInput: false,
            vaca: {
              lastYear: 0,
              thisYear: 0,
              spentThisYear: 0,
              total: 0,
              requested: 0,
              remaining: 0,
              name: user.label,
              email: email,
            },
          })
        }
      })
      .catch((err) => console.error(err))
  }

  handleEmailChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        email: value,
      },
    })
  }

  handleLastYearChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        lastYear: value,
      },
    })
  }

  handleSpentThisYearChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        spentThisYear: value,
      },
    })
  }

  handleThisYearChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        thisYear: value,
      },
    })
  }

  handleTotalAvailableChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        total: value,
      },
    })
  }

  handleRequestedChange = (value) => {
    if (this.state.disableDaysInput) {
      this.setState({
        vaca: {
          ...this.state.vaca,
          requested: parseFloat(value || 0.0),
          remaining:
            parseFloat(this.state.vaca.total) - parseFloat(value || 0.0),
        },
      })
    } else {
      this.setState({
        vaca: {
          ...this.state.vaca,
          requested: value,
        },
      })
    }
  }

  handleRemainingChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        remaining: value,
      },
    })
  }

  handleTypeChange = (value) => {
    let hideHistory = false
    if (["sick", "mobileworking", "trip"].includes(value)) {
      hideHistory = true
    }
    this.setState({
      vaca: {
        ...this.state.vaca,
        type: value,
      },
      hideHistory,
    })
  }

  handleDateChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        dateFrom: format(new Date(value[0]), "MM/dd/yyyy"),
        dateTo: format(new Date(value[1]), "MM/dd/yyyy"),
      },
    })
  }

  handleManagerChange = (manager) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        manager: manager,
      },
    })
  }

  handleNotesChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        notes: value,
      },
    })
  }

  handleWeekChange = (val) => {
    const [start, end] = val
    this.setState({
      vaca: {
        ...this.state.vaca,
        weekFrom: start,
        weekTo: end,
      },
    })
  }

  handleConfirmIllnessChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        confirmIllness: value,
      },
    })
  }

  handleClear = () => {
    this.setState({
      vaca: {
        name: this.props.session.user.name,
        email: this.props.session.user.email,
        lastYear: 0,
        thisYear: 0,
        total: 0,
        requested: 0,
        remaining: 0,
        type: 0,
        dateFrom: 0,
        dateTo: 0,
        manager: 0,
      },
    })
  }

  toggleSubmitModal = () => {
    const { vaca } = this.state
    const {
      type,
      confirmIllness,
      dateFrom,
      dateTo,
      manager,
      weekFrom,
      weekTo,
    } = vaca
    if (!this.state.openConfirmModal) {
      if (type === "sick" && !confirmIllness[0]) {
        notifyWarn("You must confirm the information to continue")
        return
      }
      if (type === "vacation" && vaca.requested === 0) {
        notifyWarn("You must not leave Requested Days on 0!")
        return
      }
      if (type !== "mobileworking" && dateFrom && dateTo && manager) {
        const tableData = [
          {
            title: "From",
            value: moment(dateFrom).format("DD.MM.YYYY"),
          },
          {
            title: "To",
            value: moment(dateTo).format("DD.MM.YYYY"),
          },
          {
            title: "Manager",
            value: manager,
          },
          {
            title: "Type",
            value: type.charAt(0).toUpperCase() + type.slice(1),
          },
          {
            title: "Requested Days",
            value: vaca.requested,
          },
        ]
        this.setState({
          openConfirmModal: !this.state.openConfirmModal,
          confirmTableData: tableData,
        })
      } else if (type === "mobileworking" && weekFrom && weekTo && manager) {
        const days = {
          mon: document.getElementById("ho-mon").checked,
          tue: document.getElementById("ho-tue").checked,
          wed: document.getElementById("ho-wed").checked,
          thu: document.getElementById("ho-thu").checked,
          fri: document.getElementById("ho-fri").checked,
        }
        const daysValue = Object.entries(days).reduce((label, day) => {
          const [name, val] = day
          if (val) {
            label += `${name.toUpperCase()} `
          }
          return label
        }, "")
        const tableData = [
          {
            title: "From",
            value: moment(weekFrom).format("DD.MM.YYYY"),
          },
          {
            title: "To",
            value: moment(weekTo).format("DD.MM.YYYY"),
          },
          {
            title: "Manager",
            value: manager,
          },
          {
            title: "Type",
            value: type.charAt(0).toUpperCase() + type.slice(1),
          },
          {
            title: "Days",
            value: daysValue,
          },
        ]
        this.setState({
          openConfirmModal: !this.state.openConfirmModal,
          confirmTableData: tableData,
        })
      } else {
        notifyInfo("Please complete the form first!")
      }
    } else {
      this.setState({
        openConfirmModal: !this.state.openConfirmModal,
      })
    }
  }

  handleSubmit = async () => {
    const host = window.location.host
    const protocol = window.location.protocol
    const {
      requested,
      dateFrom,
      dateTo,
      manager,
      type,
      email,
      name,
      notes,
      weekFrom,
      weekTo,
    } = this.state.vaca

    const approvalHash = uuid()

    if (type === "vacation" && requested === 0) {
      notifyWarn("Requested Days cannot be 0, please fill out days requested.")
      return
    }

    let days = {}
    let insertData
    if (type === "mobileworking") {
      days = {
        mon: document.getElementById("ho-mon").checked,
        tue: document.getElementById("ho-tue").checked,
        wed: document.getElementById("ho-wed").checked,
        thu: document.getElementById("ho-thu").checked,
        fri: document.getElementById("ho-fri").checked,
      }
      const insertRes = await fetch(`${protocol}//${host}/api/homeoffice`, {
        method: "POST",
        body: JSON.stringify({
          weekFrom,
          weekTo,
          days,
          manager,
          email,
          name,
          notes,
          approvalHash,
          approved: false,
          submittedBy: this.props.session.user.email,
        }),
        headers: {
          "content-type": "application/json",
        },
      })
      insertData = await insertRes.json()
    } else {
      const confirmed =
        this.state.vaca.confirmIllness[0] === "confirmed" ? 1 : 0
      const insertRes = await fetch(`${protocol}//${host}/api/mail/insert`, {
        method: "POST",
        body: JSON.stringify({
          vaca: {
            ...this.state.vaca,
            confirmIllness: confirmed,
          },
          ah: approvalHash,
          files: this.state.uploadedFiles,
        }),
        headers: {
          "content-type": "application/json",
        },
      })
      insertData = await insertRes.json()
    }

    if (insertData.affectedRows !== 1) {
      return
    }

    const sendRes = await fetch(`${protocol}//${host}/api/mail/send`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        manager: manager,
        from: dateFrom || weekFrom,
        to: dateTo || weekTo,
        type: type,
        name: name,
        note: notes,
        email: email,
        ah: approvalHash,
        days: days,
        files: this.state.uploadedFiles,
      }),
      headers: {
        "content-type": "application/json",
      },
    })
    const sendData = await sendRes.json()
    if (this.state.openConfirmModal) {
      this.setState({
        confirmed: true,
        sendSuccess: sendData.code === 200,
      })
      setTimeout(() => {
        this.setState({
          openConfirmModal: !this.state.openConfirmModal,
        })
      }, 3000)
    }
    if (insertData.code === 200 && sendData.code === 200) {
      this.setState({
        successfullySent: true,
      })
    } else if (sendData.code === 500) {
      notifyError(`Error - ${sendData.msg}`)
    }
  }

  showTimeCalculator = () => {
    this.setState({
      showCalc: !this.state.showCalc,
    })
  }

  onFileUploadSuccess = (id, fileName, fileUrl) => {
    const uploadedFiles = [...this.state.uploadedFiles]
    uploadedFiles.push({ id: id, url: fileUrl, name: fileName })
    this.setState({
      uploadedFiles,
    })
  }

  handleJoyrideCallback = (data) => {
    const { status } = data

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      // this.setState({ run: false })
      window.localStorage.setItem("tut", true)
    }
  }

  render() {
    const {
      vaca,
      availableManagers,
      openConfirmModal,
      confirmTableData,
      successfullySent,
      showCalc,
      confirmed,
      sendSuccess,
      hideHistory,
      tutSteps,
      joyrideRun,
      disableDaysInput,
    } = this.state

    const successOptions = {
      loop: false,
      autoplay: true,
      animationData: lottieSuccess,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    }

    const errorOptions = {
      loop: false,
      autoplay: true,
      animationData: lottieError,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    }

    if (this.props.session) {
      return (
        <Layout
          user={this.props.session.user.email}
          token={this.props.csrfToken}
        >
          <Container style={{ alignItems: "center" }}>
            <Subheader header="New Request" subheader="Create New" />
            <Content style={{ width: "410px" }}>
              <Form
                className="new-request-form"
                layout="vertical"
                fluid
                style={{ flexDirection: "column" }}
              >
                <Joyride
                  steps={tutSteps}
                  continuous
                  showProgress
                  showSkipButton
                  run={joyrideRun}
                  styles={{
                    options: {
                      zIndex: 1000,
                    },
                  }}
                  callback={this.handleJoyrideCallback}
                />
                <Panel
                  bordered
                  style={{ position: "relative", padding: "10px" }}
                  header={
                    <h4
                      className="form-section-heading"
                      style={{ position: "relative" }}
                    >
                      User
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ marginLeft: "15px" }}
                        width={25}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </h4>
                  }
                >
                  <FormGroup>
                    <ControlLabel>Name</ControlLabel>
                    <SelectPicker
                      name="name"
                      onChange={this.handleNameChange}
                      defaultValue={vaca.email}
                      data={this.state.availableUsers}
                      style={{ width: "100%" }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Email</ControlLabel>
                    <FormControl
                      name="email"
                      inputMode="email"
                      autoComplete="email"
                      onChange={this.handleEmailChange}
                      value={vaca.email}
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Type of Absence</ControlLabel>
                    <RadioGroup
                      onChange={this.handleTypeChange}
                      name="radioList"
                      inline
                      id="type-of-absence"
                      appearance="picker"
                      defaultValue="vacation"
                      className="absence-select"
                    >
                      <Radio value="vacation">Vacation</Radio>
                      <Radio value="sick">Illness</Radio>
                      <Radio value="trip">Trip</Radio>
                      <Radio value="mobileworking">Mobile Working</Radio>
                      <Radio value="other">Other</Radio>
                    </RadioGroup>
                  </FormGroup>
                </Panel>
                <CSSTransition
                  in={!hideHistory}
                  timeout={1000}
                  classNames="panel"
                  mountOnEnter
                  unmountOnExit
                >
                  <div
                    style={{
                      position: "relative",
                      overflow: "visible",
                      zIndex: "3",
                      marginBottom: "20px",
                    }}
                  >
                    <Panel
                      bordered
                      style={{ padding: "10px" }}
                      header={
                        <h4
                          className="form-section-heading"
                          style={{ position: "relative" }}
                        >
                          History
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            style={{ marginLeft: "15px" }}
                            width={25}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                            />
                          </svg>
                        </h4>
                      }
                    >
                      <FormGroup className="history-input-wrapper">
                        <ControlLabel>Days from Last Year</ControlLabel>
                        <InputNumber
                          min={0}
                          size="lg"
                          postfix="days"
                          value={vaca.lastYear}
                          onChange={this.handleLastYearChange}
                          disabled={disableDaysInput}
                        />
                      </FormGroup>
                      <FormGroup className="history-input-wrapper">
                        <ControlLabel>Days from this Year</ControlLabel>
                        <InputNumber
                          min={0}
                          size="lg"
                          postfix="days"
                          name="daysThisYear"
                          onChange={this.handleThisYearChange}
                          value={vaca.thisYear}
                          disabled={disableDaysInput}
                        />
                      </FormGroup>
                      <FormGroup className="history-input-wrapper">
                        <ControlLabel>Days spent This Year</ControlLabel>
                        <InputNumber
                          min={0}
                          size="lg"
                          postfix="days"
                          name="daysSpentThisYear"
                          onChange={this.handleSpentThisYearChange}
                          value={vaca.spentThisYear}
                          disabled={disableDaysInput}
                        />
                      </FormGroup>
                      <FormGroup className="history-input-wrapper">
                        <ControlLabel>Total Days Available</ControlLabel>
                        <InputNumber
                          min={0}
                          size="lg"
                          postfix="days"
                          name="totalDaysAvailable"
                          onChange={this.handleTotalAvailableChange}
                          value={vaca.total}
                          disabled={disableDaysInput}
                        />
                      </FormGroup>
                      <FormGroup className="history-input-wrapper">
                        <ControlLabel>Requested Days</ControlLabel>
                        <InputNumber
                          step={0.5}
                          size="lg"
                          id="requested-days"
                          postfix="days"
                          name="requestedDays"
                          onChange={this.handleRequestedChange}
                          value={vaca.requested}
                        />
                      </FormGroup>
                      <FormGroup
                        style={{
                          margin: "5px 20px 30px 20px",
                          color: "#a7a7a7",
                        }}
                      >
                        <small>
                          Remember, do not count weekends or{" "}
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://www.officeholidays.com/countries/germany/${new Date().getFullYear()}`}
                          >
                            German Federal Holidays
                          </a>{" "}
                          in your number of requested days.
                        </small>
                      </FormGroup>
                      <FormGroup className="history-input-wrapper">
                        <ControlLabel>Days Remaining</ControlLabel>
                        <InputNumber
                          min={0}
                          size="lg"
                          postfix="days"
                          name="remainingDays"
                          onChange={this.handleRemainingChange}
                          value={vaca.remaining}
                          disabled={disableDaysInput}
                        />
                      </FormGroup>
                    </Panel>
                    <div
                      className={`${showCalc ? "active" : ""} calc-sidebar `}
                    >
                      <Calculator />
                      <div
                        className="sidebar-button"
                        onClick={this.showTimeCalculator}
                      >
                        <div
                          className="calc-btn"
                          style={{
                            marginLeft: "10px",
                            right: "5px",
                            top: "110px",
                            position: "absolute",
                            color: "secondary",
                          }}
                        >
                          <Whisper
                            speaker={
                              <Tooltip>Calculator for Days Available</Tooltip>
                            }
                          >
                            {!showCalc ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                style={{ marginLeft: "15px" }}
                                width={25}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                style={{ marginLeft: "15px" }}
                                width={25}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            )}
                          </Whisper>
                        </div>
                      </div>
                    </div>
                  </div>
                </CSSTransition>
                {vaca.type === "mobileworking" ? (
                  <HomeOffice
                    values={{
                      availableManagers,
                      successfullySent,
                    }}
                    options={{
                      handleManagerChange: this.handleManagerChange,
                      handleNotesChange: this.handleNotesChange,
                      handleWeekChange: this.handleWeekChange,
                      toggleSubmitModal: this.toggleSubmitModal,
                      handleClear: this.handleClear,
                    }}
                  />
                ) : (
                  <Panel
                    bordered
                    style={{ padding: "10px" }}
                    id="which-days"
                    header={
                      <h4
                        className="form-section-heading"
                        style={{ position: "relative" }}
                      >
                        Dates
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          style={{ marginLeft: "15px" }}
                          width={25}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </h4>
                    }
                  >
                    <FormGroup>
                      <ControlLabel>On which days?</ControlLabel>
                      <DateRangePicker
                        placement="top"
                        isoWeek
                        showWeekNumbers
                        block
                        onChange={this.handleDateChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Manager</ControlLabel>
                      <SelectPicker
                        block
                        data={availableManagers}
                        onChange={this.handleManagerChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Note</ControlLabel>
                      <Input
                        componentClass="textarea"
                        rows={3}
                        placeholder="Optional Note"
                        onChange={this.handleNotesChange}
                      />
                    </FormGroup>
                    {vaca.type === "sick" && (
                      <FormGroup>
                        <ControlLabel className="sick-warning">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            style={{ marginRight: "15px" }}
                            width={100}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            When submitting a sick notice, don't forget to
                            submit a doctors note now, or later in your
                            dashboard by editing this request
                            <strong>if sick for more than 3 days</strong>.
                          </span>
                        </ControlLabel>
                      </FormGroup>
                    )}
                    <FormGroup style={{ marginBottom: "20px" }}>
                      <div className="upload-file">
                        <Upload
                          handleFileUploadSuccess={this.onFileUploadSuccess}
                        />
                      </div>
                    </FormGroup>
                    {vaca.type === "sick" && (
                      <FormGroup>
                        <CheckboxGroup
                          onChange={this.handleConfirmIllnessChange}
                          value={vaca.confirmIllness}
                        >
                          <Checkbox value="confirmed">
                            I hereby confirm that I was sick on the above named
                            days and the information is correct.
                          </Checkbox>
                        </CheckboxGroup>
                      </FormGroup>
                    )}
                    <FormGroup>
                      <ButtonGroup justified>
                        <Button
                          style={{ width: "50%" }}
                          onClick={this.handleClear}
                          appearance="default"
                        >
                          Clear
                        </Button>
                        <Button
                          style={{ width: "50%" }}
                          onClick={this.toggleSubmitModal}
                          disabled={successfullySent}
                          appearance="primary"
                        >
                          Submit
                        </Button>
                      </ButtonGroup>
                    </FormGroup>
                  </Panel>
                )}
              </Form>
            </Content>
          </Container>
          {openConfirmModal && (
            <Slide
              in={openConfirmModal}
              placement="top"
              exitingClassName="modal-out"
            >
              <Modal
                enforceFocus
                size="sm"
                backdrop
                show={openConfirmModal}
                onHide={this.toggleSubmitModal}
                style={{ marginTop: "80px" }}
              >
                <Modal.Header>
                  {!confirmed && (
                    <Modal.Title
                      style={{ textAlign: "center", fontSize: "24px" }}
                    >
                      Confirm Submit
                    </Modal.Title>
                  )}
                </Modal.Header>
                <Modal.Body>
                  {!confirmed ? (
                    <>
                      <span
                        style={{
                          textAlign: "center",
                          display: "block",
                          fontWeight: "600",
                        }}
                      >
                        Are you sure you want to submit the following
                        {vaca.type === "mobileworking"
                          ? " mobile working "
                          : " absence "}
                        request?
                      </span>
                      <Table
                        showHeader={false}
                        height={300}
                        bordered={false}
                        data={confirmTableData}
                        style={{ margin: "20px 50px" }}
                      >
                        <Column width={200} align="left">
                          <HeaderCell>Field: </HeaderCell>
                          <Cell dataKey="title" />
                        </Column>
                        <Column width={250} align="left">
                          <HeaderCell>Value: </HeaderCell>
                          <Cell dataKey="value" />
                        </Column>
                      </Table>
                      {(vaca.type === "sick" || vaca.type === "trip") && (
                        <span
                          style={{
                            textAlign: "center",
                            display: "block",
                            maxWidth: "80%",
                            margin: "40px auto 20px auto",
                          }}
                        >
                          You have selected to submit an absence which does not
                          require approval - instead we will send out a
                          notification to your chosen manager and team group
                          email address.
                        </span>
                      )}
                    </>
                  ) : sendSuccess ? (
                    <div className="confirmation-wrapper">
                      <Lottie
                        options={successOptions}
                        height={300}
                        width={300}
                      />
                    </div>
                  ) : (
                    <div className="confirmation-wrapper">
                      <Lottie options={errorOptions} height={300} width={300} />
                    </div>
                  )}
                </Modal.Body>
                <Modal.Footer
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <ButtonToolbar style={{ width: "100%" }}>
                    <ButtonGroup
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {!confirmed && (
                        <>
                          <Button
                            onClick={this.toggleSubmitModal}
                            style={{ width: "33%", fontSize: "16px" }}
                            appearance="default"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={this.handleSubmit}
                            style={{ width: "33%", fontSize: "16px" }}
                            appearance="primary"
                          >
                            Confirm
                          </Button>
                        </>
                      )}
                    </ButtonGroup>
                  </ButtonToolbar>
                </Modal.Footer>
              </Modal>
            </Slide>
          )}
          <style jsx>
            {`
              @media screen and (max-width: 500px) {
                :global(.last-request-sidebar) {
                  display: none;
                }
                :global(.calc-sidebar) {
                  display: none;
                }
                :global(.rs-form-control-wrapper input) {
                  max-width: 80%;
                }
                :global(.rs-content) {
                  width: 100%;
                }
                :global(.new-request-form) {
                  width: 80%;
                }
                :global(.rs-form-horizontal .rs-form-group .rs-control-label) {
                  width: 60% !important;
                }
                :global(.rs-form-control-wrapper
                    > .rs-input-number, .rs-form-control-wrapper > .rs-input) {
                  max-width: 80% !important;
                }
                :global(textarea.rs-input) {
                  min-width: unset;
                }
              }
              :global(.sick-warning) {
                display: flex !important;
                padding: 10px !important;
                border-radius: 5px;
                border: 1px solid #67b246bf;
              }
              :global(.__floater.__floater__open) {
                z-index: 1000 !important;
              }
              :global(.calc-button) {
                position: absolute;
                right: 10px;
                top: 45%;
                height: 55px;
                width: 55px;
                background-color: #fff;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 2px 0 rgba(90, 97, 105, 0.11),
                  0 4px 8px rgba(90, 97, 105, 0.12),
                  0 10px 10px rgba(90, 97, 105, 0.06),
                  0 7px 70px rgba(90, 97, 105, 0.1);
              }
              :global(.last-request-sidebar .rs-form-group) {
                margin-bottom: 10px !important;
              }
              :global(.absence-select) {
                display: flex;
                justify-content: space-around;
                width: 100%;
              }
              .confirmation-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                transition: opacity 250ms ease-in-out;
              }
              :global(.calc-sidebar) {
                position: absolute;
                right: -30px;
                top: 100px;
                height: 280px;
                width: 250px;
                border-radius: 10px;
                background-color: #fff;
                box-shadow: 0 2px 0 rgba(90, 97, 105, 0.11),
                  0 4px 8px rgba(90, 97, 105, 0.12),
                  0 10px 10px rgba(90, 97, 105, 0.06),
                  0 7px 70px rgba(90, 97, 105, 0.1);
                transition: right 250ms ease-in-out;
                z-index: -1;
              }
              :global(.calc-sidebar.active) {
                right: -240px;
              }
              :global(.history-input-wrapper) {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                margin: 15px 10px !important;
                position: relative;
              }
              .input-number {
                position: absolute;
                top: -25px;
                left: -15px;
                opacity: 0.1;
                font-size: 3rem;
                font-weight: 600;
                z-index: 1;
              }
              :global(.history-input-wrapper .rs-help-block) {
                position: absolute;
                top: 0;
                right: 10px;
              }
              :global(.rs-form-group) {
                margin-bottom: 15px;
              }
              :global(.upload-file) {
                display: inline-block;
                width: 100%;
              }
              :global(.rs-radio.rs-radio-inline) {
                margin-left: 0px !important;
              }
              :global(.last-request-panel .rs-control-label) {
                margin-left: 40px;
              }
              :global(.last-request-panel .rs-form-group) {
                margin-bottom: 20px;
              }
              :global(.last-request-panel input) {
                width: 60%;
                right: 0;
                margin-left: 40px;
                margin-top: 5px;
                color: #575757 !important;
              }
              :global(.calc-panel-body) {
                margin-bottom: 0px !important;
              }
              :global(.calc-button:hover) {
                cursor: pointer;
              }
              :global(.new-request-header) {
                width: 100%;
                text-align: center;
              }
              :global(.section-header-hr) {
                width: 30%;
                position: absolute;
              }
              :global(.sidebar-button:hover) {
                cursor: pointer;
              }
              :global(.panel-enter) {
                opacity: 0;
                height: 0;
              }
              :global(.panel-enter-active) {
                opacity: 1;
                height: 622px;
                transition: opacity 500ms, height 500ms;
              }
              :global(.panel-exit) {
                opacity: 1;
                height: 622px;
              }
              :global(.panel-exit-active) {
                opacity: 0;
                height: 0px;
                transition: opacity 500ms, height 500ms;
              }
              :global(.step-enter) {
                opacity: 0;
              }
              :global(.step-enter-active) {
                opacity: 1;
                transition: opacity 500ms;
              }
              :global(.step-exit) {
                opacity: 1;
              }
              :global(.step-exit-active) {
                opacity: 0;
                transition: opacity 500ms;
              }
              :global(.calc-enter) {
                opacity: 0;
                width: 0;
                height: 0;
              }
              :global(.calc-enter-active) {
                opacity: 1;
                width: 400px;
                transition: opacity 500ms, width 500ms;
              }
              :global(.calc-exit) {
                opacity: 1;
                width: 400px;
              }
              :global(.calc-exit-active) {
                opacity: 0;
                width: 0;
                transition: opacity 500ms, width 500ms;
              }
              :global(.section-header-hr.end) {
                right: 0;
                top: 20px;
              }
              :global(.new-request-form) {
                display: flex;
                justify-content: center;
              }
              :global(.rs-form > .rs-panel-default) {
                margin-bottom: 20px;
              }
              :global(.rs-panel-group .rs-panel + .rs-panel::before) {
                border: none;
              }
              :global(.filedrop-label) {
                display: flex !important;
                align-items: center;
                justify-content: center;
              }
              :global(.filedrop-section) {
                width: 320px;
                float: left;
              }
              :global(.filedrop-section:hover) {
                cursor: pointer;
              }
              :global(.rs-tooltip) {
                max-width: 150px;
              }
              :global(.filedrop-target) {
                min-height: 50px;
                width: 100%;
                border: 2px dashed #e5e5ea;
                text-align: center;
                color: #c0c0c3;
                padding: 20px;
                border-radius: 10px;
              }
              :global(.rs-form-control-wrapper
                  > .rs-input-number, .rs-form-control-wrapper > .rs-input) {
                width: 300px;
              }
              :global(.rs-panel-heading) {
                text-align: center;
              }
              :global(.rs-form-horizontal .rs-form-group .rs-control-label) {
                width: 100%;
                text-align: left;
                font-weight: 600;
              }
              :global(.rs-modal-backdrop.in) {
                opacity: 0.8;
              }
              :global(.form-section-heading) {
                display: flex;
                justify-content: center;
                align-items: center;
              }
            `}
          </style>
        </Layout>
      )
    } else {
      return (
        <Layout
          user={this.props.session.user.email}
          token={this.props.csrfToken}
        >
          <RequireLogin />
        </Layout>
      )
    }
  }
}

export default New
