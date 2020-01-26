import React from 'react'
import Layout from '../components/layout/index'
import fetch from 'isomorphic-unfetch'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
import Subheader from '../components/content-subheader'
import File from '../components/fileIcon'
import moment from 'moment'
import { CSSTransition } from 'react-transition-group'

import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import uuid from 'v4-uuid'
import {
  faCalendarAlt
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
  Table
} from 'rsuite'

const { Column, HeaderCell, Cell } = Table

const Preview = ({ meta }) => {
  const { name, percent, status } = meta
  return (
    <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
      {name} {/* {name} , {Math.round(percent)}%, {status} */}
    </span>
  )
}

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
      files: [],
      model: absenceModel,
      openConfirmModal: false,
      confirmText: '',
      successfullySent: false,
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
  }

  handleFileDrop = (file) => {
    console.log(file)
    const newFiles = this.state.files
    file.forEach(f => newFiles.push(f))
    this.setState({
      files: newFiles
    })
  }

  handleFileDelete = (file) => {
    const files = this.state.files
    const newFiles = files.filter(f => f.name !== file)
    this.setState({
      files: newFiles
    })
  }

  handleNameChange = (value) => {
    console.log(value)
    this.setState({
      vaca: {
        ...this.state.vaca,
        name: value
      }
    })
  }

  handleEmailChange = (value) => {
    console.log(value)
    this.setState({
      vaca: {
        ...this.state.vaca,
        email: value
      }
    })
  }

  handleLastYearChange = (value) => {
    console.log(value)
    this.setState({
      vaca: {
        ...this.state.vaca,
        lastYear: value
      }
    })
  }

  handleThisYearChange = (value) => {
    console.log(value)
    this.setState({
      vaca: {
        ...this.state.vaca,
        thisYear: value
      }
    })
  }

  handleTotalAvailableChange = (value) => {
    console.log(value)
    this.setState({
      vaca: {
        ...this.state.vaca,
        total: value
      }
    })
  }

  handleRequestedChange = (value) => {
    console.log(value)
    this.setState({
      vaca: {
        ...this.state.vaca,
        requested: value
      }
    })
  }

  handleRemainingChange = (value) => {
    console.log(value)
    this.setState({
      vaca: {
        ...this.state.vaca,
        remaining: value
      }
    })
  }

  handleTypeChange = (value) => {
    console.log(value)
    this.setState({
      vaca: {
        ...this.state.vaca,
        type: value
      }
    })
  }

  handleDateChange = (value) => {
    console.log(value)
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
    console.log(value)
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
    this.uploadRef.current.files[0].remove()
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
      name
    } = this.state.vaca

    const approvalHash = uuid()

    // Insert into DB new Request
    fetch(`${protocol}//${host}/api/mail/insert?vaca=${encodeURIComponent(JSON.stringify(this.state.vaca))}&ah=${approvalHash}`)
      .then(resp => resp.json())
      .then(data => {
        // If success, upload attachments to GDrive
        // https://www.npmjs.com/package/googleapis#media-uploads
        // https://developers.google.com/drive/api/v3/manage-uploads
        // https://developers.google.com/drive/api/v3/manage-uploads#send_a_simple_upload_request

        // Alternative: https://www.npmjs.com/package/react-google-picker
        // https://stackoverflow.com/questions/54016733/how-to-make-http-request-to-upload-file-from-reactjs-to-google-drive
        // fetch(`${protocol}//${host}/api/mail/upload?file=${file}`)
        //   .then(resp => resp.json())
        //   .then(data => {
        //     // If success, send mail to inform User
        fetch(`${protocol}//${host}/api/mail/send?manager=${manager}&from=${dateFrom}&to=${dateTo}&type=${type}&name=${name}&ah=${approvalHash}&fn=${this.state.fileName}`) // &fu=${this.state.file.url}&fn=${this.state.file.name}`)
          .then(resp => resp.json())
          .then(data => {
            if (this.state.openConfirmModal) {
              this.setState({
                openConfirmModal: !this.state.openConfirmModal
              })
            }
            if (data.code === 200) {
              this.notifyInfo('Request Sent')
              if (this.uploadRef.current.files.length) {
                this.uploadRef.current.files[0].remove()
              }
              this.setState({
                successfullySent: true
              })
            } else if (data.code === 500) {
              this.notifyWarn(`Error sending message - ${data.msg}`)
            }
          })
          .catch(err => console.error(err))
          // })
          // .catch(err => console.error(err))
      })
      .catch(err => console.error(err))
  }

  getUploadParams = (data) => {
    console.log('params', data)
    const host = window.location.host
    const protocol = window.location.protocol
    this.setState({
      fileName: data.meta.name
      // file: {
      //   url: data.meta.previewUrl,
      //   name: data.meta.name
      // }
    })
    return {
      url: `${protocol}//${host}/api/mail/upload`, // ?fn=${data.meta.name}`,
      headers: {
        // 'Content-Type': 'application/x-www-form-urlencoded',
        // 'Content-Type': data.file.type,
        // 'Content-Length': data.file.size * 1024,
        'X-CSRF-TOKEN': this.props.session.csrfToken,
        'X-XSRF-TOKEN': this.props.session.csrfToken
        // credentials: 'same-origin'
      }
    }
  }

  render () {
    const handleChangeStatus = ({ meta }, status) => {
      console.log(status, meta)
    }

    const {
      files,
      vaca,
      availableManagers,
      openConfirmModal,
      confirmTableData,
      successfullySent
    } = this.state

    if (this.props.session.user) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <Container style={{ alignItems: 'center' }}>
            <Subheader header='New Request' subheader='Create New' />
            <Content style={{ width: '410px' }}>
              <Form className='new-request-form' layout='horizontal' style={{ flexDirection: 'column' }}>
                <Panel bordered>
                  <PanelGroup style={{ maxWidth: '700px' }}>
                    <Panel
                      bordered style={{ position: 'relative' }} header={
                        <h4 className='form-section-heading' style={{ position: 'relative' }}>
                            User
                          <FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginLeft: '10px', top: '2px', position: 'absolute', color: 'secondary' }} />
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
                  </PanelGroup>
                </Panel>
                <CSSTransition
                  in={vaca.type !== 'sick'}
                  timeout={1000}
                  classNames='panel'
                  unmountOnExit
                >

                  <Panel bordered>
                    <PanelGroup>
                      <Panel
                        bordered header={
                          <h4 className='form-section-heading' style={{ position: 'relative' }}>
                            History
                            <FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginLeft: '10px', top: '2px', position: 'absolute', color: 'secondary' }} />
                          </h4>
                        }
                      >
                        <FormGroup>
                          <ControlLabel>Days from Last Year</ControlLabel>
                          <FormControl name='daysLastYear' inputMode='numeric' onChange={this.handleLastYearChange} value={vaca.lastYear} />
                          <HelpBlock tooltip>Days which you have transfered with you from last year</HelpBlock>
                        </FormGroup>
                        <FormGroup>
                          <ControlLabel>Days from this Year</ControlLabel>
                          <FormControl name='daysThisYear' inputMode='numeric' onChange={this.handleThisYearChange} value={vaca.thisYear} />
                          <HelpBlock tooltip>Days which you have earned this year</HelpBlock>
                        </FormGroup>
                        <FormGroup>
                          <ControlLabel>Total Days Available</ControlLabel>
                          <FormControl name='totalDaysAvailable' inputMode='numeric' onChange={this.handleTotalAvailableChange} value={vaca.total} />
                          <HelpBlock tooltip>The sum of the last two fields</HelpBlock>
                        </FormGroup>
                        <FormGroup>
                          <ControlLabel>Requested Days</ControlLabel>
                          <FormControl name='requestedDays' inputMode='numeric' onChange={this.handleRequestedChange} value={vaca.requested} />
                          <HelpBlock tooltip>Number of day(s) you need off. <br /> Half days = '0.5'</HelpBlock>
                        </FormGroup>
                        <FormGroup>
                          <ControlLabel>Days Remaining this Year</ControlLabel>
                          <FormControl name='remainingDays' inputMode='numeric' onChange={this.handleRemainingChange} value={vaca.remaining} />
                          <HelpBlock tooltip>Number of remaining days after subtracting requested from total available</HelpBlock>
                        </FormGroup>
                      </Panel>
                    </PanelGroup>
                  </Panel>
                </CSSTransition>
                <Panel bordered>
                  <PanelGroup>
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
                        <ControlLabel className='filedrop-label'>Documents</ControlLabel>
                        <Dropzone
                          ref={this.uploadRef}
                          getUploadParams={this.getUploadParams}
                          onChangeStatus={handleChangeStatus}
                          PreviewComponent={Preview}
                          maxFiles={1}
                          multiple={false}
                          canCancel={false}
                          inputContent='Click to select or drop an optional file (i.e. Doctors Note, etc.)'
                          inputWithFilesContent='Add Files'
                          submitButtonDisabled
                          styles={{
                            dropzone: { minHeight: 150, maxHeight: 200, border: '2px dashed #e5e5ea', borderRadius: '15px', padding: '10px', color: '#67B246', textAlign: 'center', fontWeight: '100' },
                            dropzoneActive: { borderColor: '#67B246', borderWidth: '3px' },
                            inputLabel: { color: '#67B246', fontSize: '14px' }
                          }}
                        />
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
                  </PanelGroup>
                </Panel>
              </Form>
            </Content>
          </Container>
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
          :global(.new-request-header) {
            width: 100%;
            text-align: center;
          }
          :global(.section-header-hr) {
            width: 30%;
            position: absolute;
          }
          :global(.panel-enter) {
            opacity: 0;
            height: 0;
          }
          :global(.panel-enter-active) {
            opacity: 1;
            height: 622px;
            transition: all 500ms;
          }
          :global(.panel-exit) {
            opacity: 1;
            height: 622px;
          }
          :global(.panel-exit-active) {
            opacity: 0;
            height: 0px;
            transition: all 500ms;
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
            text-align: center;
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
