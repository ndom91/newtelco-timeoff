import React from 'react'
import Link from 'next/link'
import {
  Navbar,
  Divider,
  Container,
  Header,
  Content,
  Footer,
  FlexboxGrid,
  Panel,
  Button,
  Col
} from 'rsuite'
import '../../style/newtelco-rsuite.less'

export default class extends React.Component {
  static async getInitialProps ({ query }) {
    return {
      action: query.action || null,
      type: query.type || null,
      service: query.service || null
    }
  }

  render () {
    if (this.props.action === 'signin' && this.props.type === 'oauth') {
      return (
        <div className='show-fake-browser login-page'>
          <Container className='login-wrapper'>
            <Header className='login-header-wrapper'>
              <Navbar appearance='inverse'>
                <Navbar.Header>
                  <a className='navbar-brand logo' />
                </Navbar.Header>
              </Navbar>
            </Header>
            <Content className='login-content-wrapper'>
              <FlexboxGrid style={{ marginTop: '2rem' }} justify='center'>
                <FlexboxGrid.Item componentClass={Col} colspan={26} md={10} lg={10}>
                  <Panel header={<h3 className='login-text-header'>Unable to Sign-In</h3>} bordered>
                    <div className='container'>
                      <p className='lead'>An account associated with your email address already exists.</p>
                      <p className='lead center'>
                        <Link href='/auth'>
                          <Button appearance='primary'>Sign in with email or another service</Button>
                        </Link>
                      </p>
                      <div className='row'>
                        <div className='col-sm-8 mr-auto ml-auto mb-5 mt-5'>
                          <div className='text-muted'>
                            <h4 className='mb-2'>Why am I seeing this?</h4>
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
                            {/* <h4 className='mb-2'>How do I fix this?</h4>
                            <p className='mb-0'>
                              First sign in using your email address then link your account to the service you want
                              to use to sign in with in future. You only need to do this once.
                            </p> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Panel>
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </Content>
            <Footer className='login-footer-wrapper' />
          </Container>
          <style jsx>{`
            .text-center {
              margin: 100px 0 50px 0;
            } 
            :global(.rs-panel-heading) {
              background-color: #e4e4e4;
            }
            :global(.login-text-header) {
              background-color: #e4e4e4;
            }
            :global(.login-page) {
              display: flex;
              flex-direction: column;
            }
            :global(.login-wrapper) {
              height: 100vh;
            }
            :global(.login-header-wrapper) {

            }
            :global(.login-content-wrapper) {
              flex-grow: 1;
            }
            :global(.login-footer-wrapper) {
              height: 56px;
              display: flex;
              padding: 10px 30px;
              align-items: center;
              background-color: #e4e4e4;
            }
            :global(a.btn-outline-secondary:hover) {
              text-decoration: none;
            }
            #email::placeholder {
              opacity: 0.4;
            }
            :global(.center) {
              display: flex;
              justify-content: center;
              margin: 20px 0;
            }
          `}
          </style>
        </div>
      )
    } else if (this.props.action === 'signin' && this.props.type === 'token-invalid') {
      return (
        <div className='container'>
          <div className='text-center'>
            <h1 className='display-4 mt-5 mb-2'>Link not valid</h1>
            <p className='lead'>This sign in link is no longer valid.</p>
            <p className='lead'><Link href='/auth'><a>Get a new sign in link</a></Link></p>
          </div>
        </div>
      )
    } else {
      return (
        <div className='container'>
          <div className='text-center'>
            <h1 className='display-4 mt-5'>Error signing in</h1>
            <p className='lead'>An error occured while trying to sign in.</p>
            <p className='lead'><Link href='/auth'><a>Sign in with email or another service</a></Link></p>
          </div>
        </div>
      )
    }
  }
}
