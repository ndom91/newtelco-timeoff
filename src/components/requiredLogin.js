import React from 'react'
import Link from 'next/link'
import '../style/newtelco-rsuite.less'
import {
  Navbar,
  Container,
  Header,
  Content,
  Footer,
  FlexboxGrid,
  Panel,
  Form,
  FormGroup,
  ControlLabel,
  ButtonToolbar,
  Button
} from 'rsuite'

export default class RequireLogin extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      companyInfo: {
        companyName: '',
        address: ''
      }
    }
  }

  componentDidMount () {
    if (typeof window !== 'undefined') {
      const companyInfo = JSON.parse(window.localStorage.getItem('company'))
      this.setState({
        companyInfo
      })
    }
  }

  render () {
    return (
      <div className='show-fake-browser login-page'>
        <Container>
          <Header>
            <Navbar appearance='inverse'>
              <Navbar.Header>
                <p className='navbar-brand logo'>{this.state.companyInfo.companyName}</p>
              </Navbar.Header>
            </Navbar>
          </Header>
          <Content style={{ marginTop: '20px' }}>
            <FlexboxGrid justify='center'>
              <FlexboxGrid.Item colspan={12}>
                <Panel header={<h3>Login</h3>} bordered>
                  <Form fluid>
                    <FormGroup>
                      <ControlLabel>You must be signed in to view this content</ControlLabel>
                    </FormGroup>
                    <FormGroup>
                      <ButtonToolbar>
                        <Link href='/auth'>
                          <Button appearance='primary'>Sign in</Button>
                        </Link>
                      </ButtonToolbar>
                    </FormGroup>
                  </Form>
                </Panel>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Content>
          <Footer>{this.state.companyInfo.address}</Footer>
        </Container>
        <style jsx>{`
          .card-outline {
            border: 3px solid rgba(244,10,10,0.3);
            box-shadow: 0 0 10px 1px rgba(244,10,10,0.3);
          }
          .require-login-wrapper {
            display: flex;
            align-content: center;
          }
          .require-login-wrapper > div {
            margin-top: 20px;
            font-family: Lato, Helvetica;
          }
          .navbar-brand {
            display: flex;
            justify-content: center;
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            align-items: center;
            height: 100%;
          }
          :global(.rs-navbar-header) {
            width: 100%;
          }
          :global(.rs-footer) {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          #signin-btn {
            margin-bottom: 20px;
          }
        `}
        </style>
      </div>
    )
  }
}
