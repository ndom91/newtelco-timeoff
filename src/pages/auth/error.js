import React from 'react'
import Link from 'next/link'
import Wrapper from './wrapper'
import {
  Panel,
  Button
} from 'rsuite'
import '../../style/newtelco-rsuite.less'

export default class extends React.Component {
  static async getInitialProps({ query }) {
    return {
      action: query.action || null,
      type: query.type || null,
      service: query.service || null
    }
  }

  render() {
    if (this.props.action === 'signin' && this.props.type === 'oauth') {
      return (
        <Wrapper>
          <Panel header={<h3 className='login-text-header'>Unable to Sign-In</h3>} bordered>
            <div className='container'>
              <p className='lead'>An account associated with your email address already exists.</p>
              <p className='lead center'>
                <Link href='/auth'>
                  <Button style={{ textAlign: 'center' }} appearance='primary'>Sign in with email or another service</Button>
                </Link>
              </p>
              <div className='row'>
                <div className='col-sm-8 mr-auto ml-auto mb-5 mt-5'>
                  <div className='text-muted'>
                    <h4 style={{ textAlign: 'center' }} className='mb-2'>Why am I seeing this?</h4>
                    <p className='mb-3'>
                      It looks like you might have already signed up using another service to sign in.
                    </p>
                    <p className='mb-3'>
                      If you have previously signed up using another service you must link accounts before you
                      can use a different service to sign in.
                    </p>
                    <p className='mb-5'>
                      This is to prevent people from signing up to another service using your email address
                      to try and access your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </Wrapper>
      )
    } else if (this.props.action === 'signin' && this.props.type === 'token-invalid') {
      return (
        <Wrapper>
          <Panel header={<h3 className='login-text-header'>Link no longer valid</h3>} bordered>
            <div className='container'>
              <div className='text-center'>
                <p className='lead'>This sign in link is no longer valid.</p>
                <p className='lead'><Link href='/auth'><a>Get a new sign in link</a></Link></p>
              </div>
            </div>
          </Panel>.
        </Wrapper>
      )
    } else {
      return (
        <Wrapper>
          <Panel header={<h3 className='login-text-header'>Error Signing In</h3>} bordered>
            <div className='container'>
              <div className='text-center'>
                <p className='lead'>An error occured while trying to sign in.</p>
                <p className='lead'><Link href='/auth'><a>Sign in with email or another service</a></Link></p>
              </div>
            </div>
          </Panel>
        </Wrapper>
      )
    }
  }
}
