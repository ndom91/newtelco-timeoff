import React from 'react'
import Link from 'next/link'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import fetch from 'isomorphic-unfetch'
import {
  Nav,
  Navbar,
  Dropdown,
  Sidenav,
  Sidebar,
  Icon
} from 'rsuite'
import NTLogo from '../../public/static/img/newtelco_letters.svg'

const NavToggle = ({ expand, onChange, token, handleSignOut }) => {
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
              <form id='signout' method='post' action='/auth/signout' onSubmit={handleSignOut}>
                <input name='_csrf' type='hidden' value={token} />
                <div className='logout-btn-wrapper'>
                  <button
                    className='logout-btn'
                    type='submit'
                    onClick={handleSignOut}
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
class SidebarNT extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      // expand: props.expand,
      settings: {
        companyName: ''
      }
    }
  }

  componentDidMount () {
    const protocol = window.location.protocol
    const host = window.location.host
    const companyInfo = JSON.parse(window.localStorage.getItem('company'))
    // const expandStorage = window.localStorage.getItem('layout-expand')
    if (companyInfo) {
      this.setState({
        // expand: expandStorage === 'true',
        settings: {
          companyName: companyInfo.companyName
        }
      })
    } else {
      fetch(`${protocol}//${host}/api/settings/company/info`)
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

  render () {
    return (
      <Sidebar
        style={{ display: 'flex', flexDirection: 'column' }}
        width={this.props.expand ? 260 : 56}
        className='sidebar-wrapper'
      >
        <Sidenav.Header>
          <div className='sidenav-header'>
            <img src={NTLogo} alt='Logo' style={{ height: '32px', width: '32px', marginTop: '-5px', marginLeft: '-5px' }} />
            {/* <h3 style={{ display: 'inline', fontWeight: '200', marginLeft: 12 }}>
              {this.state.settings.companyName}
            </h3> */}
          </div>
        </Sidenav.Header>
        <Sidenav
          expanded={this.props.expand}
          defaultOpenKeys={['4', '5']}
          appearance='default'
        >
          <Sidenav.Body>
            <Nav>
              <Link passHref href='/'>
                <Nav.Item eventKey='1' active={typeof window !== 'undefined' && Router.pathname === '/'} icon={<Icon icon='area-chart' />}>
                      Dashboard
                </Nav.Item>
              </Link>
              <Link passHref href='/new'>
                <Nav.Item eventKey='3' active={typeof window !== 'undefined' && Router.pathname === '/new'} icon={<Icon icon='plus-square' />}>
                      New Request
                </Nav.Item>
              </Link>
              <Link passHref href='/user'>
                <Nav.Item eventKey='2' active={typeof window !== 'undefined' && Router.pathname === '/user'} icon={<Icon icon='user' />}>
                  {this.props.user.substr(0, this.props.user.indexOf('@'))}
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
                <Link passHref href='/team/dashboard'>
                  <Dropdown.Item
                    eventKey='4-1'
                    active={typeof window !== 'undefined' && Router.pathname === '/team/dashboard'}
                  >
                        Dashboard
                  </Dropdown.Item>
                </Link>
                <Link passHref href='/team/calendar'>
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
                {/* <Link passHref href='/settings/general'>
                  <Dropdown.Item
                    eventKey='5-1'
                    active={typeof window !== 'undefined' && Router.pathname === '/settings/general'}
                  >
                        General
                  </Dropdown.Item>
                </Link> */}
                {this.props.admin
                  ? (
                    <Link
                      href={{
                        pathname: '/settings/admin',
                        query: {
                          admin: this.props.admin
                        }
                      }}
                      as='/settings/admin'
                      passHref
                    >
                      <Dropdown.Item
                        eventKey='5-2'
                        active={typeof window !== 'undefined' && Router.pathname === '/settings/admin'}
                      >
                            Admin
                      </Dropdown.Item>
                    </Link>
                  ) : (
                    null
                  )}
              </Dropdown>
            </Nav>
          </Sidenav.Body>
        </Sidenav>
        <NavToggle expand={this.props.expand} handleSignOut={this.onSignOutSubmit} token={this.props.token} onChange={this.props.handleToggle} />
        <style jsx>{`
          :global(.sidebar-wrapper) {
            width: ${this.props.expand ? '260px' : '56px'};
          }
        `}
        </style>
      </Sidebar>
    )
  }
}

export default SidebarNT
