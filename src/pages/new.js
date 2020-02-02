import React from 'react'
import Layout from '../components/layout/index'
import fetch from 'isomorphic-unfetch'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
import Subheader from '../components/content-subheader'
import moment from 'moment'
import { CSSTransition } from 'react-transition-group'
import Calculator from '../components/newcalculator'
import { Tooltip } from 'react-tippy'
import 'react-tippy/dist/tippy.css'
import UploadFile from '../components/uploadfile'
import { InView } from 'react-intersection-observer'
import uuid from 'v4-uuid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarAlt,
  faUser,
  faHistory,
  faAngleRight,
  faAngleLeft
} from '@fortawesome/free-solid-svg-icons'
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
  PanelGroup,
  Panel,
  ButtonToolbar,
  ButtonGroup,
  Schema,
  SelectPicker,
  Modal,
  Notification,
  HelpBlock,
  Table,
  Steps
} from 'rsuite'

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
    return {
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)

    this.uploadRef = React.createRef()

    const { StringType, NumberType, DateType } = Schema.Types
    const absenceModel = Schema.Model({
      name: StringType().isRequired('Name is required'),
      email: StringType().isEmail('Please enter a correct email'),
      daysFromLastYear: NumberType('Please enter a valid number'),
      daysFromThisYear: NumberType('Please enter a valid number'),
      totalDaysAvailable: NumberType('Please enter a valid number'),
      requestedDays: NumberType('Please enter a valid number'),
      daysRemaining: NumberType('Please enter a valid number'),
      type: StringType().isRequired('Please select an option'),
      dateRange: DateType().isRequired('Please select a valid date range')
    })

    this.state = {
      model: absenceModel,
      openConfirmModal: false,
      confirmText: '',
      successfullySent: false,
      sideBar: 20,
      calcSideBar: -30,
      uploading: false,
      loaded: 0,
      message: 'Please click or drop file',
      uploadedFiles: [],
      currentStep: 0,
      vaca: {
        name: props.session.user.name,
        email: props.session.user.email,
        lastYear: '',
        thisYear: '',
        total: '',
        requested: '',
        remaining: '',
        type: 'vacation',
        dateFrom: '',
        dateTo: '',
        manager: '',
        notes: ''
      },
      lastRequest: {
        lastYear: 0,
        thisYear: 0,
        total: 0,
        requested: 0,
        remaining: 0
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
    fetch(`${protocol}//${host}/api/managers`)
      .then(res => res.json())
      .then(data => {
        const managerData = []
        data.managerEntries.forEach(m => {
          managerData.push({ label: m.name, value: m.email })
        })
        this.setState({
          availableManagers: managerData
        })
      })
      .catch(err => console.error(err))

    const email = this.props.session.user.email
    fetch(`${protocol}//${host}/api/user/entries/last?u=${email}`)
      .then(res => res.json())
      .then(data => {
        const newRequest = {
          lastYear: data.lastRequest[0].resturlaubVorjahr,
          thisYear: data.lastRequest[0].jahresurlaubInsgesamt,
          total: data.lastRequest[0].restjahresurlaubInsgesamt,
          requested: data.lastRequest[0].beantragt,
          remaining: data.lastRequest[0].resturlaubJAHR,
          from: moment(data.lastRequest[0].fromDate).format('DD.MM.YYYY'),
          to: moment(data.lastRequest[0].toDate).format('DD.MM.YYYY'),
          submitted: moment(data.lastRequest[0].submitted_datetime).format('DD.MM.YYYY HH:mm')
        }
        this.setState({
          lastRequest: newRequest
        })
      })
      .catch(err => console.error(err))
  }

  // handleFileDrop = (file) => {
  //   console.log(file)
  //   const newFiles = this.state.files
  //   file.forEach(f => newFiles.push(f))
  //   this.setState({
  //     files: newFiles
  //   })
  // }

  // handleFileDelete = (file) => {
  //   const files = this.state.files
  //   const newFiles = files.filter(f => f.name !== file)
  //   this.setState({
  //     files: newFiles
  //   })
  // }

  handleNameChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        name: value
      }
    })
  }

  handleEmailChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        email: value
      }
    })
  }

  handleLastYearChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        lastYear: value
      }
    })
  }

  handleThisYearChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        thisYear: value
      }
    })
  }

  handleTotalAvailableChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        total: value
      }
    })
  }

  handleRequestedChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        requested: value
      }
    })
  }

  handleRemainingChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        remaining: value
      }
    })
  }

  handleTypeChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        type: value
      }
    })
  }

  handleDateChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        dateFrom: value[0],
        dateTo: value[1]
      }
    })
  }

  handleManagerChange = (manager) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        manager: manager
      }
    })
  }

  handleNotesChange = (value) => {
    this.setState({
      vaca: {
        ...this.state.vaca,
        notes: value
      }
    })
  }

  handleClear = () => {
    this.setState({
      vaca: {
        name: this.props.session.user.name,
        email: this.props.session.user.email,
        lastYear: '',
        thisYear: '',
        total: '',
        requested: '',
        remaining: '',
        type: '',
        dateFrom: '',
        dateTo: '',
        manager: ''
      }
    })
  }

  toggleSubmitModal = () => {
    if (!this.state.openConfirmModal) {
      if (this.state.vaca.dateFrom && this.state.vaca.dateTo && this.state.vaca.manager) {
        const { vaca } = this.state
        const tableData = [
          {
            title: 'From',
            value: moment(vaca.dateFrom).format('DD.MM.YYYY')
          },
          {
            title: 'To',
            value: moment(vaca.dateTo).format('DD.MM.YYYY')
          },
          {
            title: 'Manager',
            value: vaca.manager
          },
          {
            title: 'Type',
            value: vaca.type.charAt(0).toUpperCase() + vaca.type.slice(1)
          },
          {
            title: 'Requested Days',
            value: vaca.requested
          },
          {
            title: 'Remaining Days',
            value: vaca.remaining
          }
        ]
        this.setState({
          openConfirmModal: !this.state.openConfirmModal,
          confirmTableData: tableData
        })
      } else {
        this.notifyInfo('Please complete the form')
      }
    } else {
      this.setState({
        openConfirmModal: !this.state.openConfirmModal
      })
    }
  }

  handleSubmit = () => {
    const host = window.location.host
    const protocol = window.location.protocol
    const {
      dateFrom,
      dateTo,
      manager,
      type,
      name,
      notes
    } = this.state.vaca

    const approvalHash = uuid()

    fetch(`${protocol}//${host}/api/mail/insert`, {
      method: 'POST',
      body: JSON.stringify({
        vaca: this.state.vaca,
        ah: approvalHash,
        files: this.state.uploadedFiles
      }),
      headers: {
        'X-CSRF-TOKEN': this.props.session.csrfToken
      }
    })
      .then(resp => resp.json())
      .then(data => {
        fetch(`${protocol}//${host}/api/mail/send`, {
          method: 'POST',
          body: JSON.stringify({
            manager: manager,
            from: dateFrom,
            to: dateTo,
            type: type,
            name: name,
            note: notes,
            ah: approvalHash,
            files: this.state.uploadedFiles
          }),
          headers: {
            'X-CSRF-TOKEN': this.props.session.csrfToken
          }
        })
          .then(resp => resp.json())
          .then(data => {
            if (this.state.openConfirmModal) {
              this.setState({
                openConfirmModal: !this.state.openConfirmModal
              })
            }
            if (data.code === 200) {
              this.notifyInfo('Request Sent')
              this.setState({
                successfullySent: true
              })
            } else if (data.code === 500) {
              this.notifyWarn(`Error sending message - ${data.msg}`)
            }
          })
          .catch(err => console.error(err))
      })
      .catch(err => console.error(err))
  }

  showTimeCalculator = () => {
    const {
      calcSideBar
    } = this.state

    if (calcSideBar === -30) {
      this.setState({
        calcSideBar: -240
      })
    } else {
      this.setState({
        calcSideBar: -30
      })
    }
  }

  showLastRequestSidebar = () => {
    const {
      sideBar
    } = this.state

    if (sideBar === 20) {
      this.setState({
        sideBar: 260
      })
    } else {
      this.setState({
        sideBar: 20
      })
    }
  }

  onFileUploadSuccess = (files) => {
    const uploadedFiles = [...this.state.uploadedFiles]

    if (Array.isArray(files)) {
      files.forEach(file => {
        uploadedFiles.push({ id: file.public_id, url: file.url, name: file.original_filename })
      })
    } else {
      uploadedFiles.push({ id: files.public_id, url: files.url, name: files.original_filename })
    }

    this.setState({
      uploadedFiles
    })
  }

  getCurrentStep = (inView, entry) => {
    const currentStep = entry.target.localName
    if (currentStep === 'dates' && inView === true) {
      this.setState({
        currentStep: 2
      })
    } else if (currentStep === 'history' && inView === true) {
      this.setState({
        currentStep: 1
      })
    } else if (currentStep === 'user' && inView === true) {
      this.setState({
        currentStep: 0
      })
    }
  }

  render () {
    const {
      vaca,
      availableManagers,
      openConfirmModal,
      confirmTableData,
      successfullySent,
      sideBar,
      calcSideBar,
      lastRequest,
      currentStep
    } = this.state

    if (this.props.session.user) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <div className='steps-wrapper'>
            <Steps current={currentStep} vertical style={{ width: '200px', display: 'inline-table', verticalAlign: 'top', height: '500px' }}>
              <Steps.Item title='User' description='Details' />
              <CSSTransition
                in={vaca.type !== 'sick'}
                timeout={1000}
                classNames='step'
              >
                <Steps.Item title='History' description='Requests' />
              </CSSTransition>
              <Steps.Item title='Dates' description='Days' />
            </Steps>
          </div>
          <Container style={{ alignItems: 'center' }}>
            <Subheader header='New Request' subheader='Create New' />
            <Content style={{ width: '410px' }}>
              <Form className='new-request-form' layout='horizontal' style={{ flexDirection: 'column' }}>
                <Panel bordered>
                  <PanelGroup style={{ maxWidth: '700px' }}>
                    <InView as='user' onChange={(inView, entry) => this.getCurrentStep(inView, entry)} threshold={0.2}>
                      <Panel
                        bordered style={{ position: 'relative' }} header={
                          <h4 className='form-section-heading' style={{ position: 'relative' }}>
                          User
                            <FontAwesomeIcon icon={faUser} width='1em' style={{ marginLeft: '10px', top: '2px', position: 'absolute', color: 'secondary' }} />
                          </h4>
                        }
                      >
                        <FormGroup>
                          <ControlLabel>Name</ControlLabel>
                          <FormControl name='name' onChange={this.handleNameChange} value={vaca.name} style={{ width: '320px' }} />
                        </FormGroup>
                        <FormGroup>
                          <ControlLabel>Email</ControlLabel>
                          <FormControl name='email' inputMode='email' autoComplete='email' onChange={this.handleEmailChange} value={vaca.email} style={{ width: '320px' }} />
                        </FormGroup>
                        <FormGroup>
                          <ControlLabel>Type of Absence</ControlLabel>
                          <RadioGroup onChange={this.handleTypeChange} name='radioList' inline appearance='picker' defaultValue='vacation' style={{ width: '320px' }}>
                            <Radio value='vacation'>Vacation</Radio>
                            <Radio value='sick'>Illness</Radio>
                            <Radio value='moving'>Moving</Radio>
                            <Radio value='other'>Other</Radio>
                          </RadioGroup>
                        </FormGroup>
                      </Panel>
                    </InView>
                  </PanelGroup>
                </Panel>
                <CSSTransition
                  in={vaca.type !== 'sick'}
                  timeout={1000}
                  classNames='panel'
                  unmountOnExit
                >
                  <div
                    style={{ position: 'relative', overflow: 'visible', zIndex: '3', marginBottom: '20px' }}
                  >
                    <Panel
                      style={{ position: 'relative', overflow: 'visible', zIndex: '3' }}
                      bordered
                    >
                      <InView as='history' onChange={(inView, entry) => this.getCurrentStep(inView, entry)} threshold={1}>
                        <PanelGroup>
                          <Panel
                            bordered header={
                              <h4 className='form-section-heading' style={{ position: 'relative' }}>
                              History
                                <FontAwesomeIcon icon={faHistory} width='1em' style={{ marginLeft: '10px', top: '2px', position: 'absolute', color: 'secondary' }} />
                              </h4>
                            }
                          >
                            <FormGroup className='history-input-wrapper'>
                              <ControlLabel>Days from Last Year</ControlLabel>
                              <InputNumber min={0} size='lg' postfix='days' value={vaca.lastYear} onChange={this.handleLastYearChange} />
                              <HelpBlock tooltip>Days which you have transfered with you from last year</HelpBlock>
                            </FormGroup>
                            <FormGroup className='history-input-wrapper'>
                              <ControlLabel>Days from this Year</ControlLabel>
                              <InputNumber min={0} size='lg' postfix='days' name='daysThisYear' onChange={this.handleThisYearChange} value={vaca.thisYear} />
                              <HelpBlock tooltip>Days which you have earned this year</HelpBlock>
                            </FormGroup>
                            <FormGroup className='history-input-wrapper'>
                              <ControlLabel>Total Days Available</ControlLabel>
                              <InputNumber min={0} size='lg' postfix='days' name='totalDaysAvailable' onChange={this.handleTotalAvailableChange} value={vaca.total} />
                              <HelpBlock tooltip>The sum of the last two fields</HelpBlock>
                            </FormGroup>
                            <FormGroup className='history-input-wrapper'>
                              <ControlLabel>Requested Days</ControlLabel>
                              <InputNumber min={0} size='lg' postfix='days' name='requestedDays' onChange={this.handleRequestedChange} value={vaca.requested} />
                              <HelpBlock tooltip>Number of day(s) you need off. <br /> Half days = '0.5'</HelpBlock>
                            </FormGroup>
                            <FormGroup className='history-input-wrapper'>
                              <ControlLabel>Days Remaining</ControlLabel>
                              <InputNumber min={0} size='lg' postfix='days' name='remainingDays' onChange={this.handleRemainingChange} value={vaca.remaining} />
                              <HelpBlock tooltip>Number of remaining days after subtracting requested from total available</HelpBlock>
                            </FormGroup>
                          </Panel>
                        </PanelGroup>
                      </InView>
                    </Panel>
                    <div className='calc-sidebar'>
                      <Calculator />
                      <div className='sidebar-button' onClick={this.showTimeCalculator}>
                        <div style={{ marginLeft: '10px', right: '2px', top: '110px', position: 'absolute', color: 'secondary' }}>
                          <Tooltip
                            title='Calculator for Days Available'
                            position='right'
                            trigger='mouseenter'
                            distance='20'
                            offset='-23'
                          >
                            <FontAwesomeIcon icon={calcSideBar === -30 ? faAngleRight : faAngleLeft} width='2em' />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </CSSTransition>
                <Panel bordered>
                  <PanelGroup>
                    <InView as='dates' onChange={(inView, entry) => this.getCurrentStep(inView, entry)} threshold={0.5}>
                      <Panel
                        bordered header={
                          <h4 className='form-section-heading' style={{ position: 'relative' }}>
                          Dates
                            <FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginLeft: '10px', top: '2px', position: 'absolute', color: 'secondary' }} />
                          </h4>
                        }
                      >
                        <FormGroup>
                          <ControlLabel>On which days?</ControlLabel>
                          <DateRangePicker
                            placement='top'
                            style={{ width: 320 }}
                            showWeekNumbers
                            onChange={this.handleDateChange}
                          />
                        </FormGroup>
                        <FormGroup>
                          <ControlLabel>Manager</ControlLabel>
                          <SelectPicker data={availableManagers} onChange={this.handleManagerChange} style={{ width: '320px' }} />
                        </FormGroup>
                        <FormGroup>
                          <ControlLabel>Note</ControlLabel>
                          <Input componentClass='textarea' rows={3} placeholder='Optional Note' onChange={this.handleNotesChange} style={{ width: '320px' }} />
                        </FormGroup>
                        <FormGroup>
                          <ControlLabel className='filedrop-label'>
                          Documents
                          </ControlLabel>
                          <div
                            className='upload-file'
                          >
                            <UploadFile
                              email={this.props.session.user.email}
                              csrfToken={this.props.session.csrfToken}
                              handleFileUploadSuccess={this.onFileUploadSuccess}
                            />
                          </div>
                        </FormGroup>
                        <FormGroup>
                          <ButtonToolbar style={{ paddingLeft: '0px' }}>
                            <ButtonGroup style={{ width: '320px' }}>
                              <Button style={{ width: '50%' }} onClick={this.handleClear} appearance='default'>Clear</Button>
                              <Button style={{ width: '50%' }} onClick={this.toggleSubmitModal} disabled={successfullySent} appearance='primary'>Submit</Button>
                            </ButtonGroup>
                          </ButtonToolbar>
                        </FormGroup>
                      </Panel>
                    </InView>
                  </PanelGroup>
                </Panel>
              </Form>
            </Content>
          </Container>
          <div className='last-request-sidebar'>
            <Panel className='last-request-panel' header='Last Request' style={{ boxShadow: 'none' }}>
              <FormGroup>
                <ControlLabel>Submitted</ControlLabel>
                <Input disabled value={lastRequest.submitted} />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Days from Last Year</ControlLabel>
                <Input disabled value={lastRequest.lastYear} />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Days from This Year</ControlLabel>
                <Input disabled value={lastRequest.thisYear} />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Total Days Available</ControlLabel>
                <Input disabled value={lastRequest.total} />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Requested Days</ControlLabel>
                <Input disabled value={lastRequest.requested} />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Days Remaining</ControlLabel>
                <Input disabled value={lastRequest.remaining} />
              </FormGroup>
              <FormGroup>
                <ControlLabel>From</ControlLabel>
                <Input disabled value={lastRequest.from} />
              </FormGroup>
              <FormGroup>
                <ControlLabel style={{ marginRight: '20px' }}>To</ControlLabel>
                <Input disabled value={lastRequest.to} />
              </FormGroup>
            </Panel>
            <div className='sidebar-button' onClick={this.showLastRequestSidebar}>
              <div style={{ marginLeft: '10px', right: '10px', top: '325px', position: 'absolute', color: 'secondary' }}>
                <Tooltip
                  title='View Last Request Details'
                  trigger='mouseenter'
                  distance='15'
                  offset='-23'
                  position='right'
                  sticky
                >
                  <FontAwesomeIcon icon={sideBar === 20 ? faAngleRight : faAngleLeft} width='2em' />
                </Tooltip>
              </div>
            </div>
          </div>
          {openConfirmModal && (
            <Modal enforceFocus size='sm' backdrop show={openConfirmModal} onHide={this.toggleSubmitModal} style={{ marginTop: '150px' }}>
              <Modal.Header>
                <Modal.Title style={{ textAlign: 'center', fontSize: '24px' }}>Confirm Submit</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <span style={{ textAlign: 'center', display: 'block', fontWeight: '600' }}>Are you sure you want to submit the following absence request?</span>
                <Table showHeader={false} autoHeight bordered={false} data={confirmTableData} style={{ margin: '20px 50px' }}>
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
                    <Button onClick={this.handleSubmit} style={{ width: '33%', fontSize: '16px' }} appearance='primary'>
                      Confirm
                    </Button>
                    <Button onClick={this.toggleSubmitModal} style={{ width: '33%', fontSize: '16px' }} appearance='default'>
                      Cancel
                    </Button>
                  </ButtonGroup>
                </ButtonToolbar>
              </Modal.Footer>
            </Modal>
          )}
          <style jsx>{`
          :global(.calc-button) {
            position: absolute;
            right:10px;
            top: 45%;
            height: 55px;
            width: 55px;
            background-color: #fff;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 2px 0 rgba(90,97,105,.11), 0 4px 8px rgba(90,97,105,.12), 0 10px 10px rgba(90,97,105,.06), 0 7px 70px rgba(90,97,105,.1);
          }
          .last-request-sidebar {
            position: absolute;
            left: ${this.state.sideBar}px;
            top: 200px;
            height: 740px;
            width: 300px;
            border-radius: 10px;
            background-color: #fff;
            box-shadow: 0 2px 0 rgba(90,97,105,.11), 0 4px 8px rgba(90,97,105,.12), 0 10px 10px rgba(90,97,105,.06), 0 7px 70px rgba(90,97,105,.1);
            transition: all 250ms ease-in-out;
          }
          .calc-sidebar {
            position: absolute;
            right: ${this.state.calcSideBar}px;
            top: 100px;
            height: 280px;
            width: 250px;
            border-radius: 10px;
            background-color: #fff;
            box-shadow: 0 2px 0 rgba(90,97,105,.11), 0 4px 8px rgba(90,97,105,.12), 0 10px 10px rgba(90,97,105,.06), 0 7px 70px rgba(90,97,105,.1);
            transition: all 250ms ease-in-out;
            z-index: -1;
          }
          :global(.history-input-wrapper) {
            display: flex;
          }
          :global(.steps-wrapper) {
            position: absolute;
            right: 20px;
            top: 100px;
          }
          :global(.upload-file) {
            display: inline-block;
            width: 100%;
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
          :global(.rs-form-control-wrapper > .rs-input-number, .rs-form-control-wrapper > .rs-input) {
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
