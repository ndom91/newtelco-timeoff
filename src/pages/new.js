import React from 'react'
import Layout from '../components/layout/index'
import fetch from 'isomorphic-unfetch'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
import File from '../components/fileIcon'
import moment from 'moment'

// import Dropzone from 'react-dropzone'
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
            value: vaca.type
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
        fetch(`${protocol}//${host}/api/mail/upload?file=${file}`)
          .then(resp => resp.json())
          .then(data => {
            // If success, send mail to inform User
            fetch(`${protocol}//${host}/api/mail/send?manager=${manager}&from=${dateFrom}&to=${dateTo}&type=${type}&name=${name}&ah=${approvalHash}`)
              .then(resp => resp.json())
              .then(data => {
                if (this.state.openConfirmModal) {
                  this.setState({
                    openConfirmModal: !this.state.openConfirmModal
                  })
                }
                if (data.code === 200) {
                  this.notifyInfo('Request Sent')
                } else if (data.code === 500) {
                  this.notifyWarn(`Error sending message - ${data.msg}`)
                }
              })
              .catch(err => console.error(err))
          })
          .catch(err => console.error(err))
      })
      .catch(err => console.error(err))
  }

  render () {
    const getUploadParams = (data) => {
      console.log('params', data)
      return {
        url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=media',
        headers: {
          'Content-Type': data.file.type,
          'Content-Length': data.file.size * 1024,
          Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`
        }
      }
    }

    const handleChangeStatus = ({ meta }, status) => {
      console.log(status, meta)
    }

    const handleSubmit = (files, allFiles) => {
      console.log(files.map(f => f.meta))
      allFiles.forEach(f => f.remove())
    }

    const {
      files,
      vaca,
      availableManagers,
      openConfirmModal,
      confirmTableData
    } = this.state

    if (this.props.session.user) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <Container style={{ alignItems: 'center' }}>
            <Content style={{ width: '410px' }}>
              <Panel bordered>
                <Form className='new-request-form' layout='horizontal'>
                  <PanelGroup style={{ maxWidth: '700px' }}>
                    <Panel bordered style={{ position: 'relative' }} header={<><hr className='section-header-hr' /><h4 className='form-section-heading' style={{ position: 'relative' }}>User<FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginLeft: '10px', top: '2px', position: 'absolute', color: 'secondary' }} /></h4><hr className='section-header-hr end' /></>}>
                      <FormGroup>
                        <ControlLabel>Name</ControlLabel>
                        <FormControl name='name' onChange={this.handleNameChange} value={vaca.name} style={{ width: '320px' }} />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>Email</ControlLabel>
                        <FormControl name='email' type='email' onChange={this.handleEmailChange} value={vaca.email} style={{ width: '320px' }} />
                      </FormGroup>
                    </Panel>
                    <Panel bordered header={<><hr className='section-header-hr' /><h4 className='form-section-heading' style={{ position: 'relative' }}>History<FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginLeft: '10px', top: '2px', position: 'absolute', color: 'secondary' }} /></h4><hr className='section-header-hr end' /></>}>
                      <FormGroup>
                        <ControlLabel>Days from Last Year</ControlLabel>
                        <FormControl name='daysLastYear' type='number' onChange={this.handleLastYearChange} value={vaca.lastYear} />
                        <HelpBlock tooltip>Days which you have transfered with you from last year</HelpBlock>
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>Days from this Year</ControlLabel>
                        <FormControl name='daysThisYear' type='number' onChange={this.handleThisYearChange} value={vaca.thisYear} />
                        <HelpBlock tooltip>Days which you have earned this year</HelpBlock>
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>Total Days Available</ControlLabel>
                        <FormControl name='totalDaysAvailable' type='number' onChange={this.handleTotalAvailableChange} value={vaca.total} />
                        <HelpBlock tooltip>The sum of the last two fields</HelpBlock>
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>Requested Days</ControlLabel>
                        <FormControl name='requestedDays' type='number' onChange={this.handleRequestedChange} value={vaca.requested} />
                        <HelpBlock tooltip>Number of day(s) you need off. <br /> Half days = '0.5'</HelpBlock>
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>Days Remaining this Year</ControlLabel>
                        <FormControl name='remainingDays' type='number' onChange={this.handleRemainingChange} value={vaca.remaining} />
                        <HelpBlock tooltip>Number of remaining days after subtracting requested from total available</HelpBlock>
                      </FormGroup>
                    </Panel>
                    <Panel bordered header={<><hr className='section-header-hr' /><h4 className='form-section-heading' style={{ position: 'relative' }}>Dates<FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginLeft: '10px', top: '2px', position: 'absolute', color: 'secondary' }} /></h4><hr className='section-header-hr end' /></>}>
                      <FormGroup>
                        <ControlLabel>Type of Absence</ControlLabel>
                        <RadioGroup onChange={this.handleTypeChange} name='radioList' inline appearance='picker' defaultValue='vacation'>
                          <Radio value='vacation'>Vacation</Radio>
                          <Radio value='sick'>Illness</Radio>
                          <Radio value='newborn'>Newborn</Radio>
                          <Radio value='moving'>Moving</Radio>
                        </RadioGroup>
                        {/* <HelpBlock tooltip>Required</HelpBlock> */}
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>When do you need off?</ControlLabel>
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
                        {/* <Dropzone onDrop={acceptedFiles => this.handleFileDrop(acceptedFiles)}>
                          {({ getRootProps, getInputProps }) => (
                            <section className='filedrop-section'>
                              <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p className='filedrop-target'>Click here or drop file to upload optional documentation (Doctors Note, etc.)</p>
                              </div>
                              {files.length > 0
                                ? (
                                  files.map(file => {
                                    return <File onDelete={this.handleFileDelete} file={file} key={file.id} />
                                  })
                                ) : (
                                  null
                                )}
                            </section>
                          )}
                        </Dropzone> */}
                        <Dropzone
                          getUploadParams={getUploadParams}
                          onChangeStatus={handleChangeStatus}
                          onSubmit={handleSubmit}
                          styles={{ dropzone: { minHeight: 200, maxHeight: 250 } }}
                        />
                      </FormGroup>
                      <FormGroup>
                        <ButtonToolbar style={{ paddingLeft: '0px' }}>
                          <ButtonGroup style={{ width: '320px' }}>
                            <Button style={{ width: '50%' }} onClick={this.handleClear} appearance='default'>Clear</Button>
                            <Button style={{ width: '50%' }} onClick={this.toggleSubmitModal} appearance='primary'>Submit</Button>
                          </ButtonGroup>
                        </ButtonToolbar>
                      </FormGroup>
                    </Panel>
                  </PanelGroup>
                </Form>
              </Panel>
            </Content>
          </Container>
          <Modal enforceFocus size='sm' backdrop show={openConfirmModal} onHide={this.toggleSubmitModal} style={{ marginTop: '150px' }}>
            <Modal.Header>
              <Modal.Title style={{ fontSize: '24px' }}>Confirm Submit</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to submit the following absence request?
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
          <style jsx>{`
            :global(.new-request-header) {
              width: 100%;
              text-align: center;
            }
            :global(.section-header-hr) {
              width: 30%;
              position: absolute;
            }
            :global(.section-header-hr.end) {
              right: 0;
              top: 20px;
            }
            :global(.new-request-form) {
              display: flex;
              justify-content: center;
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
