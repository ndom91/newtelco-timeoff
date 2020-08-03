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
  Button,
} from 'rsuite'

export default class RequireLogin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      companyInfo: {
        companyName: '',
        address: '',
      },
    }
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      if (window.localStorage.getItem('company')) {
        const companyInfo = JSON.parse(window.localStorage.getItem('company'))
        this.setState({
          companyInfo,
        })
      }
    }
  }

  render() {
    const {companyInfo} = this.state
    return (
      <div className='show-fake-browser login-page'>
        <Container>
          <Content style={{marginTop: '50px'}}>
            <FlexboxGrid justify='center'>
              <FlexboxGrid.Item md={8} lg={6}>
                <Panel
                  header={<h3 className='login-text-header'>Login</h3>}
                  bordered
                >
                  <Form fluid>
                    <FormGroup>
                      <ControlLabel
                        style={{
                          fontSize: '14px',
                          marginTop: '10px',
                          marginBottom: '10px',
                        }}
                      >
                        You must be signed in to view this content. <br />
                        <br />
                        Please click below to continue.
                      </ControlLabel>
                    </FormGroup>
                    <FormGroup>
                      <ButtonToolbar>
                        <Link href='/auth/signin'>
                          <Button block appearance='ghost'>
                            Sign in
                          </Button>
                        </Link>
                      </ButtonToolbar>
                    </FormGroup>
                  </Form>
                </Panel>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Content>
          <Footer>
            {companyInfo.companyName !== '' && (
              <span>
                {companyInfo.companyName} - {companyInfo.address}
              </span>
            )}
          </Footer>
        </Container>
        <style jsx>
          {`
            :global(body) {
              background-color: #efefef;
            }
            .card-outline {
              border: 3px solid rgba(244, 10, 10, 0.3);
              box-shadow: 0 0 10px 1px rgba(244, 10, 10, 0.3);
            }
            :global(.login-text-header) {
              font-weight: 100;
            }
            :global(.rs-panel) {
              box-shadow: 0 2px 0 rgba(90, 97, 105, 0.11),
                0 4px 8px rgba(90, 97, 105, 0.12),
                0 10px 10px rgba(90, 97, 105, 0.06),
                0 7px 70px rgba(90, 97, 105, 0.1);
            }
            :global(.rs-panel-body) {
              background-color: #fff;
            }
            :global(.rs-panel-heading) {
              background-color: #67b246;
              color: #fff;
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
