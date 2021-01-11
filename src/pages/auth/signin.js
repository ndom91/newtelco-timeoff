import React from 'react'
import Router from 'next/router'
import { getSession, getProviders, signIn } from 'next-auth/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import NewtelcoSvg from '../../components/newtelcosvg'
import anime from 'animejs'
import '../../style/newtelco-rsuite.less'
// import VacaPattern from '../../../public/static/img/vacation_pattern.svg'
import {
  Container,
  Content,
  Footer,
  FlexboxGrid,
  Panel,
  FormGroup,
  ButtonToolbar,
  Button,
  Col,
} from 'rsuite'
import Wrapper from './wrapper'
import './index.css'

export default class App extends React.Component {
  static async getInitialProps({ req, query }) {
    console.log(req)
    const approvalHash = query.h
    const action = query.a
    const completed = query.b

    return {
      session: await getSession({ req }),
      providers: await getProviders({ req }),
      params: {
        approvalHash,
        action,
        completed,
      },
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      email: '',
      session: this.props.session,
    }
  }

  animateText = () => {
    anime({
      targets: '.path0, .path1',
      strokeDashoffset: [anime.setDashoffset, 3],
      easing: 'easeInOutSine',
      duration: 3500,
      delay: function (el, i) {
        return i * 250
      },
      direction: 'alternate',
      loop: false,
    })
  }

  componentDidMount() {
    if (this.props.session) {
      const { approvalHash, action, completed } = this.props.params

      Router.push(`/?h=${approvalHash}&a=${action}&b=${completed}`)
    }
    this.animateText()
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/settings/company/info`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          this.setState({
            companyName: data.companyInfo[0].companyName,
          })
        }
      })
      .catch(err => console.error(err))
  }

  render() {
    if (this.props.session) {
      return (
        <Wrapper>
          {/* <LinkAccounts
            session={this.props.session}
            linkedAccounts={this.props.linkedAccounts}
          /> */}
        </Wrapper>
      )
    } else {
      return (
        <div className='show-fake-browser login-page'>
          {/* <img src={Taieri} className='vacation-background' /> */}
          <Container className='login-wrapper'>
            <Content className='login-content-wrapper'>
              <FlexboxGrid justify='center' className='login-grid-wrapper'>
                <NewtelcoSvg />
                <FlexboxGrid.Item justify='center'>
                  <Panel
                    header={<h3 className='login-text-header'>Login</h3>}
                    bordered
                    shaded
                  >
                    <SignInButtons providers={this.props.providers} />
                  </Panel>
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </Content>
            <Footer className='login-footer-wrapper'>
              {this.state.companyName
                ? `${this.state.companyName} ${new Date().getFullYear()}`
                : null}
            </Footer>
          </Container>
          <style jsx>
            {`
              @media screen and (max-width: 500px) {
                :global(.login-grid-wrapper > svg) {
                  max-width: 85%;
                }
                :global(.google-signin-btn svg) {
                  width: 8.5em;
                  margin-right: 5px;
                }
              }
              .vacation-background {
                position: absolute;
                height: 100%;
                width: 100%;
                z-index: -10;
              }
              .text-center {
                margin: 100px 0 50px 0;
              }
              :global(.rs-panel-heading) {
                background-color: #e8e8e8;
                color: #a7a7a7;
              }
              :global(.rs-panel-body) {
                background-color: #fff;
              }
              :global(.rs-panel-bordered) {
                margin-top: 50px;
                box-shadow: 0 2px 0 rgba(90, 97, 105, 0.11),
                  0 4px 8px rgba(90, 97, 105, 0.12),
                  0 10px 10px rgba(90, 97, 105, 0.06),
                  0 7px 70px rgba(90, 97, 105, 0.1);
              }
              :global(.login-grid-wrapper) {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 100px;
              }
              :global(#signin) {
                margin-top: 10px;
              }
              :global(.newtelco-svg) {
                margin: 30px 0;
              }
              :global(.login-page) {
                display: flex;
                flex-direction: column;
              }
              :global(.login-wrapper) {
                height: 100vh;
              }
              :global(.login-text-header) {
                font-weight: 100;
              }
              :global(.login-content-wrapper) {
                background-color: transparent;
                flex-grow: 1;
              }
              :global(.login-footer-wrapper) {
                height: 56px;
                display: flex;
                padding: 10px 30px;
                align-items: center;
                background-color: #e4e4e4;
                font-family: 'Roboto', Helvetica;
                font-weight: 300;
              }
              :global(a.btn-outline-secondary:hover) {
                text-decoration: none;
              }
              #email::placeholder {
                opacity: 0.4;
              }
            `}
          </style>
        </div>
      )
    }
  }
}

export class SignInButtons extends React.Component {
  render() {
    return (
      <>
        {Object.values(this.props.providers).map((provider, i) => {
          return (
            <Button
              style={{
                width: '100%',
                height: '40px',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '10px 0',
                padding: '0 50px',
              }}
              key={provider.name}
              onClick={() => signIn(provider.id)}
              className='google-signin-btn'
              appearance='secondary'
            >
              <FontAwesomeIcon
                icon={faGoogle}
                width='1.2em'
                style={{
                  width: '1.2rem',
                  height: '1.2rem',
                  color: 'secondary',
                  marginRight: '5px',
                  flexGrow: '1',
                }}
              />
              <span style={{ flexGrow: '4' }}>
                Sign in with {provider.name}
              </span>
            </Button>
          )
        })}
      </>
    )
  }
}
