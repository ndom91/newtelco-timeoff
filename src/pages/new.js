import React from 'react'
import Layout from '../components/layout/index'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
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
  SelectPicker,
  PanelGroup,
  Panel,
  ButtonToolbar
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
    // const absenceTypes = [
    //   { label: 'Vacation', value: 'vacation' },
    //   { label: 'Illness', value: 'sick' },
    //   { label: 'Maternity / Paternity', value: 'newborn' },
    //   { label: 'Moving', value: 'moving' }
    // ]

    if (this.props.session.user) {
      return (
        <Layout token={this.props.session.csrfToken}>
          <Container>
            <Content>
              <Form layout='horizontal'>
                <PanelGroup>
                  <Panel bordered header='User Details'>
                    <FormGroup>
                      <ControlLabel>Name</ControlLabel>
                      <FormControl name='name' value={this.props.session.user.name} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Email</ControlLabel>
                      <FormControl name='email' type='email' value={this.props.session.user.email} />
                    </FormGroup>
                  </Panel>
                  <Panel bordered header='History'>
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
                  <Panel bordered header='Other'>
                    <FormGroup>
                      <ControlLabel>Type of Absence</ControlLabel>
                      <RadioGroup name='radioList' inline appearance='picker' defaultValue='A'>
                        <Radio value='A'>Vacation</Radio>
                        <Radio value='B'>Newborn</Radio>
                        <Radio value='C'>Illness</Radio>
                        <Radio value='D'>Moving</Radio>
                      </RadioGroup>
                      <HelpBlock tooltip>Required</HelpBlock>
                      {/* <SelectPicker
                        data={absenceTypes}
                        appearance='default'
                        placement='top'
                        placeholder='Please select...'
                        searchable={false}
                        style={{ width: 224 }}
                      /> */}
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>When do you need off?</ControlLabel>
                      <DateRangePicker
                        placement='top'
                        style={{ width: 280 }}
                      />
                    </FormGroup>
                  </Panel>
                </PanelGroup>
                <FormGroup>
                  <ControlLabel>Documents</ControlLabel>
                  <HelpBlock tooltip>Optional</HelpBlock>
                </FormGroup>
                <FormGroup>
                  <ButtonToolbar>
                    <Button appearance='primary'>Submit</Button>
                    <Button appearance='default'>Cancel</Button>
                  </ButtonToolbar>
                </FormGroup>
              </Form>
            </Content>
          </Container>
          <style jsx>{`
            :global(.new-request-header) {
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
