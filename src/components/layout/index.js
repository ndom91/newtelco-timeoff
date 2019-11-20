import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { NextAuth } from 'next-auth/client'
import fetch from 'isomorphic-unfetch'
import '../../style/newtelco-rsuite.less'
import {
  Nav,
  Navbar,
  Dropdown,
  Sidenav,
  Sidebar,
  Icon,
  Container,
  Header,
  Content,
  Footer,
  Breadcrumb
} from 'rsuite'
import NTLogo from '../../../public/static/img/newtelco_letters.svg'

const NavToggle = ({ expand, onChange }, props) => {
  return (
    <Navbar appearance='subtle' className='nav-toggle'>
      <Navbar.Body>
        <Nav>
          <Dropdown
            placement='topStart'
            trigger='click'
            renderTitle={children => {
              return <Icon className='icon-style' icon='cog' />
            }}
          >
            <Dropdown.Item>Help</Dropdown.Item>
            <Dropdown.Item>Settings</Dropdown.Item>
            <Dropdown.Item>
              <form id='signout' method='post' action='/auth/signout' onSubmit={props.handleSignOut}>
                <input name='_csrf' type='hidden' value={props.token} />
                <div className='logout-btn-wrapper'>
                  <button
                    className='logout-btn'
                    type='submit'
                    onClick={(ev) => ev.preventDefault()}
                  >
                    Sign out
                  </button>
                </div>
              </form>

            </Dropdown.Item>
          </Dropdown>
        </Nav>

        <Nav pullRight>
          <Nav.Item onClick={onChange} style={{ width: 56, textAlign: 'center' }}>
            <Icon icon={expand ? 'angle-left' : 'angle-right'} />
          </Nav.Item>
        </Nav>
      </Navbar.Body>
    </Navbar>
  )
}

class Layout extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      expand: '',
      settings: {
        companyName: ''
      }
    }
  }

  componentDidMount () {
    const host = window.location.host
    const companyInfo = JSON.parse(window.localStorage.getItem('company'))
    const expandStorage = window.localStorage.getItem('layout-expand')
    if (companyInfo) {
      this.setState({
        expand: expandStorage === 'true',
        settings: {
          companyName: companyInfo.companyName
        }
      })
    } else {
      fetch(`http://${host}/api/settings/company/info`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            window.localStorage.setItem('company', JSON.stringify(data.companyInfo[0]))
            this.setState({
              settings: {
                companyName: data.companyInfo[0].companyName
              }
            })
          }
        })
        .catch(err => console.error(err))
    }
  }

  handleToggle = () => {
    window.localStorage.setItem('layout-expand', !this.state.expand)
    this.setState({
      expand: !this.state.expand
    })
  }

  onSignOutSubmit = (event) => {
    event.preventDefault()
    NextAuth.signout()
      .then(() => {
        Router.push('/auth/callback')
      })
      .catch(err => {
        process.env.NODE_ENV === 'development' && console.err(err)
        Router.push('/auth/error?action=signout')
      })
  }

  capitalizeFirstLetter = (string) => {
    if (string === '') {
      return 'Dashboard'
    }
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  render () {
    const { expand } = this.state

    return (
      <div className='show-fake-browser sidebar-page wrapper'>
        <Container>
          <Sidebar
            style={{ display: 'flex', flexDirection: 'column' }}
            width={expand ? 260 : 56}
            collapsible
          >
            <Sidenav.Header>
              <div className='sidenav-header'>
                <img src={NTLogo} alt='Logo' style={{ height: '32px', width: '32px', marginTop: '-5px', marginLeft: '-5px' }} />
                <h3 style={{ display: 'inline', fontWeight: '200', marginLeft: 12 }}>
                  {this.state.settings.companyName}
                </h3>
              </div>
            </Sidenav.Header>
            <Sidenav
              expanded={expand}
              defaultOpenKeys={['4', '5']}
              appearance='default'
            >
              <Sidenav.Body>
                <Nav>
                  <Link href='/'>
                    <Nav.Item eventKey='1' active={typeof window !== 'undefined' && Router.pathname === '/'} icon={<Icon icon='area-chart' />}>
                      Dashboard
                    </Nav.Item>
                  </Link>
                  <Link href='/user'>
                    <Nav.Item eventKey='2' active={typeof window !== 'undefined' && Router.pathname === '/user'} icon={<Icon icon='user' />}>
                      User
                    </Nav.Item>
                  </Link>
                  <Link href='/new'>
                    <Nav.Item eventKey='3' active={typeof window !== 'undefined' && Router.pathname === '/new'} icon={<Icon icon='plus-square' />}>
                      New
                    </Nav.Item>
                  </Link>
                  <Dropdown
                    eventKey='4'
                    trigger='hover'
                    title='Team'
                    icon={<Icon icon='group' />}
                    placement='rightStart'
                    active={typeof window !== 'undefined' && Router.pathname.includes('team')}
                  >
                    <Link href='/team/dashboard'>
                      <Dropdown.Item
                        eventKey='4-1'
                        active={typeof window !== 'undefined' && Router.pathname === '/team/dashboard'}
                      >
                        Dashboard
                      </Dropdown.Item>
                    </Link>
                    <Link href='/team/calendar'>
                      <Dropdown.Item
                        eventKey='4-2'
                        active={typeof window !== 'undefined' && Router.pathname === '/team/calendar'}
                      >
                        Calendar
                      </Dropdown.Item>
                    </Link>
                  </Dropdown>
                  <Dropdown
                    eventKey='5'
                    trigger='hover'
                    title='Settings'
                    icon={<Icon icon='cog' />}
                    placement='rightStart'
                    active={typeof window !== 'undefined' && Router.pathname.includes('settings')}
                  >
                    <Link href='/settings/general'>
                      <Dropdown.Item
                        eventKey='5-1'
                        active={typeof window !== 'undefined' && Router.pathname === '/settings/general'}
                      >
                        General
                      </Dropdown.Item>
                    </Link>
                    <Link href='/settings/admin'>
                      <Dropdown.Item
                        eventKey='5-2'
                        active={typeof window !== 'undefined' && Router.pathname === '/settings/admin'}
                      >
                        Admin
                      </Dropdown.Item>
                    </Link>
                  </Dropdown>
                </Nav>
              </Sidenav.Body>
            </Sidenav>
            <NavToggle expand={expand} handleSignOut={this.onSignOutSubmit} token={this.props.token} onChange={this.handleToggle} />
          </Sidebar>
          <Container className='wrapper'>
            <Header>
              <div className='header-wrapper'>
                <h4 className='header-section-title'>
                  {typeof window !== 'undefined' && this.capitalizeFirstLetter(Router.pathname.split('/').slice(1)[Router.pathname.split('/').slice(1).length - 1].substr(0, Router.pathname.length))}
                </h4>
                <span>
                  <Breadcrumb separator='>' style={{ marginBottom: '0px' }}>
                    <Breadcrumb.Item>Home</Breadcrumb.Item>
                    {typeof window !== 'undefined' &&
                      Router.pathname.split('/').slice(1).map((level, index) => {
                        if (level !== '') {
                          return (
                            <Breadcrumb.Item active={index === Router.pathname.split('/').slice(1).length - 1} key={`${index}${level}`}>
                              {this.capitalizeFirstLetter(level)}
                            </Breadcrumb.Item>
                          )
                        }
                      })}
                  </Breadcrumb>
                </span>
              </div>
            </Header>
            <Content className='content-wrapper'>
              {this.props.children}
            </Content>
            <Footer className='footer-wrapper'>
              {`${this.state.settings.companyName} ${new Date().getFullYear()}`}
            </Footer>
          </Container>
        </Container>
        <style jsx>{`
          :global(.wrapper) {
          }
          :global(.header-wrapper) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
          }
          :global(.content-wrapper) {
            padding: 20px;
            overflow-y: scroll;
          }
          :global(.footer-wrapper) {
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 10px 20px;
          }
          :global(.logout-btn) {
            background-color: transparent;
            padding: 0;
          }
          :global(.wrapper, .rs-container-has-sidebar) {
            height: 100vh;
          }
          :global(.rs-sidenav) {
            flex-grow: 1;
          }
          :global(.sidenav-header h3) {
            line-height: 20px;
            margin-left: 42px !important;
          }
          :global(.sidenav-header) {
            padding: 18px;
            font-size: 16px;
            height: 56px;
            background: #67B246;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            display: ${!this.state.expand ? 'inline-block' : 'flex'};
            width: ${!this.state.expand ? '56px' : '260px'};
            justify-content: flex-start;
            transition: all 150ms linear;
          }
          :global(.header-section-title) {
            font-size: 1.3rem;
            font-weight: 400;
          }
          :global(.icon-style) {
            width: 56px;
            height: 56px;
            line-height: 56px;
            text-align: center;
          }
          :global(.rs-btn-subtle.rs-btn-active) {
            color: #8e8e93;
          }
          :global(::-webkit-scrollbar-track) {
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0);
            border-radius: 10px;
            background-color: rgba(0,0,0,0);
          }
          :global(::-webkit-scrollbar) {
            width: 8px;
            height: 8px;
            background-color: transparent;
          }
          :global(::-webkit-scrollbar-thumb) {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.2);
            background-color: rgba(0,0,0,0.4);
          }
        `}
        </style>
      </div>
    )
  }
}

export default Layout
