import React from 'react'
import Layout from '../components/layout/index'
import fetch from 'isomorphic-unfetch'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
import File from '../components/fileIcon'
import moment from 'moment'
import Dropzone from 'react-dropzone'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
  Button,
  Radio,
  RadioGroup,
  PanelGroup,
  Panel,
  ButtonToolbar,
  ButtonGroup,
  Schema,
  SelectPicker,
  Modal
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
        type: '',
        dateFrom: '',
        dateTo: '',
        manager: ''
      }
    }
  }

  componentDidMount () {
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/managers`)
      .then(res => res.json())
      .then(data => {
        console.log(data)
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
      const { vaca } = this.state
      const confirmText = `Are you sure you want to submit the vacation from <b>${moment(vaca.dateFrom).format('DD.MM.YYYY')}</b> to <b>${moment(vaca.dateTo).format('DD.MM.YYYY')}</b> by requesting <b>${vaca.requested}</b> days off?`
      this.setState({
        openConfirmModal: !this.state.openConfirmModal,
        confirmText: confirmText
      })
    } else {
      this.setState({
        openConfirmModal: !this.state.openConfirmModal
      })
    }
  }

  handleSubmit = () => {

  }

  render () {
    const {
      files,
      vaca,
      availableManagers,
      openConfirmModal
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
                        <FormControl name='name' onChange={this.handleNameChange} value={vaca.name} />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>Email</ControlLabel>
                        <FormControl name='email' type='email' onChange={this.handleEmailChange} value={vaca.email} />
                      </FormGroup>
                    </Panel>
                    <Panel bordered header={<><hr className='section-header-hr' /><h4 className='form-section-heading' style={{ position: 'relative' }}>History<FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginLeft: '10px', top: '2px', position: 'absolute', color: 'secondary' }} /></h4><hr className='section-header-hr end' /></>}>
                      <FormGroup>
                        <ControlLabel>Days from Last Year</ControlLabel>
                        <FormControl name='daysLastYear' type='text' onChange={this.handleLastYearChange} value={vaca.lastYear} />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>Days from this Year</ControlLabel>
                        <FormControl name='daysThisYear' type='text' onChange={this.handleThisYearChange} value={vaca.thisYear} />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>Total Days Available</ControlLabel>
                        <FormControl name='totalDaysAvailable' type='text' onChange={this.handleTotalAvailableChange} value={vaca.total} />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>Requested Days</ControlLabel>
                        <FormControl name='requestedDays' type='text' onChange={this.handleRequestedChange} value={vaca.requested} />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>Days Remaining this Year</ControlLabel>
                        <FormControl name='remainingDays' type='text' onChange={this.handleRemainingChange} value={vaca.remaining} />
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
                        <SelectPicker data={availableManagers} style={{ width: '320px' }} />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel className='filedrop-label'>Documents</ControlLabel>
                        <Dropzone onDrop={acceptedFiles => this.handleFileDrop(acceptedFiles)}>
                          {({ getRootProps, getInputProps }) => (
                            <section className='filedrop-section'>
                              <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p className='filedrop-target'>Click here or drop file to upload optional documentation</p>
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
                        </Dropzone>
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
          <Modal enforceFocus size='xs' backdrop show={openConfirmModal} onHide={this.toggleSubmitModal}>
            <Modal.Header>
              <Modal.Title>Confirm Submit</Modal.Title>
            </Modal.Header>
            <Modal.Body dangerouslySetInnerHTML={{ __html: this.state.confirmText }} />
            <Modal.Footer style={{ display: 'flex', justifyContent: 'center' }}>
              <ButtonToolbar style={{ width: '100%' }}>
                <ButtonGroup style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <Button onClick={this.handleSubmit} style={{ width: '33%' }} appearance='primary'>
                  Ok
                  </Button>
                  <Button onClick={this.toggleSubmitModal} style={{ width: '33%' }} appearance='default'>
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
              width: 320px;
            }
            :global(.rs-panel-heading) {
              text-align: center;
            }
            :global(.rs-form-horizontal .rs-form-group .rs-control-label) {
              width: 100%;
              text-align: center;
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
