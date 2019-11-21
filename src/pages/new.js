import React from 'react'
import Layout from '../components/layout/index'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
import Dropzone from 'react-dropzone'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser
} from '@fortawesome/free-regular-svg-icons'
import {
  faHistory,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons'
import {
  Container,
  Content,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  DateRangePicker,
  Button,
  Radio,
  RadioGroup,
  PanelGroup,
  Panel,
  ButtonToolbar,
  ButtonGroup
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

  render () {
    if (this.props.session.user) {
      return (
        <Layout token={this.props.session.csrfToken}>
          <Container>
            <Content>
              <Form className='new-request-form' layout='horizontal'>
                <PanelGroup style={{ maxWidth: '700px' }}>
                  <Panel bordered header={<h4 style={{ position: 'relative' }}>User Details<FontAwesomeIcon icon={faUser} width='1em' style={{ marginLeft: '10px', top: '2px', position: 'absolute', color: 'secondary' }} /></h4>}>
                    <FormGroup>
                      <ControlLabel>Name</ControlLabel>
                      <FormControl name='name' value={this.props.session.user.name} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Email</ControlLabel>
                      <FormControl name='email' type='email' value={this.props.session.user.email} />
                    </FormGroup>
                  </Panel>
                  <Panel bordered header={<h4 style={{ position: 'relative' }}>History<FontAwesomeIcon icon={faHistory} width='1em' style={{ marginLeft: '10px', top: '5px', position: 'absolute', color: 'secondary' }} /></h4>}>
                    <FormGroup>
                      <ControlLabel>Days from Last Year</ControlLabel>
                      <FormControl name='daysLastYear' type='text' />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Days from this Year</ControlLabel>
                      <FormControl name='daysThisYear' type='text' />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Total Days Available</ControlLabel>
                      <FormControl name='totalDaysAvailable' type='text' />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Requested Days</ControlLabel>
                      <FormControl name='requestedDays' type='text' />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Days Remaining this Year</ControlLabel>
                      <FormControl name='remainingDays' type='text' />
                    </FormGroup>
                  </Panel>
                  <Panel bordered header={<h4 style={{ position: 'relative' }}>Other<FontAwesomeIcon icon={faCalendarAlt} width='1em' style={{ marginLeft: '10px', top: '2px', position: 'absolute', color: 'secondary' }} /></h4>}>
                    <FormGroup>
                      <ControlLabel>Type of Absence</ControlLabel>
                      <RadioGroup name='radioList' inline appearance='picker' defaultValue='A'>
                        <Radio value='A'>Vacation</Radio>
                        <Radio value='B'>Illness</Radio>
                        <Radio value='C'>Newborn</Radio>
                        <Radio value='D'>Moving</Radio>
                      </RadioGroup>
                      <HelpBlock tooltip>Required</HelpBlock>
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>When do you need off?</ControlLabel>
                      <DateRangePicker
                        placement='top'
                        style={{ width: 320 }}
                      />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel className='filedrop-label'>Documents</ControlLabel>
                      <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
                        {({ getRootProps, getInputProps }) => (
                          <section className='filedrop-section'>
                            <div {...getRootProps()}>
                              <input {...getInputProps()} />
                              <p className='filedrop-target'>Click here or drop file to upload optional documentation</p>
                            </div>
                          </section>
                        )}
                      </Dropzone>
                    </FormGroup>
                    <FormGroup>
                      <ButtonToolbar>
                        <ButtonGroup style={{ width: '320px' }}>
                          <Button style={{ width: '50%' }} appearance='default'>Cancel</Button>
                          <Button style={{ width: '50%' }} appearance='primary'>Submit</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </FormGroup>
                  </Panel>
                </PanelGroup>
              </Form>
            </Content>
          </Container>
          <style jsx>{`
            :global(.new-request-header) {
              width: 100%;
              text-align: center;
            }
            :global(.new-request-form) {
              display: flex;
              justify-content: center;
            }
            :global(.filedrop-label) {
              height: 70px;
              display: flex !important;
              align-items: center;
              justify-content: flex-end;
            }
            :global(.filedrop-section) {
              width: 320px;
              float: left;
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
