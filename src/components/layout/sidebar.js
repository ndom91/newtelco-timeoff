import React from 'react'
import Link from 'next/link'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import { Nav, Navbar, Dropdown, Sidenav, Sidebar, Modal, Icon } from 'rsuite'
// import { Icon } from '@rsuite/icons'
import NTLogo from '../../../public/static/img/newtelco_letters.svg'
import NTLogoL from '../../../public/static/img/newtelco.svg'
import NDOLogo from '../../../public/static/img/ndo-gray.png'
import * as S from '../heroicons'

const NavToggle = ({
  expand,
  onChange,
  token,
  handleSignOut,
  toggleHelpModal,
}) => {
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
            <Dropdown.Item onClick={toggleHelpModal}>About</Dropdown.Item>
            <Dropdown.Item>
              <form
                id='signout'
                method='post'
                action='/auth/signout'
                onSubmit={handleSignOut}
              >
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
          <Nav.Item
            onClick={onChange}
            style={{ width: 56, textAlign: 'center' }}
          >
            <Icon as={expand ? 'angle-left' : 'angle-right'} />
          </Nav.Item>
        </Nav>
      </Navbar.Body>
    </Navbar>
  )
}
class SidebarNT extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      settings: {
        companyName: '',
        openHelpModal: false,
      },
      team: '',
    }
  }

  componentDidMount() {
    const protocol = window.location.protocol
    const host = window.location.host
    const companyInfo = JSON.parse(window.localStorage.getItem('company'))
    const userTeam = JSON.parse(window.localStorage.getItem('userTeam'))
    if (companyInfo) {
      this.setState({
        settings: {
          companyName: companyInfo.companyName,
        },
        team: userTeam.team,
      })
    } else {
      fetch(`${protocol}//${host}/api/settings/company/info`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            window.localStorage.setItem(
              'company',
              JSON.stringify(data.companyInfo[0])
            )
            this.setState({
              settings: {
                companyName: data.companyInfo[0].companyName,
              },
            })
          }
        })
        .catch(err => console.error(err))
    }
  }

  handleHelpModal = () => {
    this.setState({
      openHelpModal: !this.state.openHelpModal,
    })
  }

  onSignOutSubmit = event => {
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

  pageActive = path => {
    if (typeof window !== 'undefined') {
      if (window.location !== 'undefined') {
        if (path === Router.pathname) return true
      }
    }
  }

  render() {
    const { openHelpModal, team } = this.state

    return (
      <Sidebar
        style={{ display: 'flex', flexDirection: 'column' }}
        width={this.props.expand ? 260 : 56}
        className='sidebar-wrapper'
      >
        <Sidenav.Header>
          <div className='sidenav-header'>
            {!this.props.expand && (
              <img
                src={NTLogo}
                alt='Logo'
                className='header-img'
                style={{
                  height: '32px',
                  width: '32px',
                  marginTop: '-10px',
                  marginLeft: '-10px',
                }}
              />
            )}
            {this.props.expand && (
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: '100',
                  fontFamily: 'Roboto',
                  textAlign: 'left',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}
              >
                <img
                  src={NTLogoL}
                  alt='Logo'
                  style={{
                    height: '48px',
                    width: '188px',
                    marginTop: '0px',
                    marginLeft: '5px',
                    marginRight: '10px',
                  }}
                />
              </span>
            )}
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
                <Nav.Item
                  eventKey='1'
                  active={this.pageActive('/')}
                  icon={<S.Dashboard width='22' />}
                >
                  Dashboard
                </Nav.Item>
              </Link>
              <Link passHref href='/new'>
                <Nav.Item
                  eventKey='3'
                  active={this.pageActive('/new')}
                  icon={<S.New width='22' />}
                >
                  New Request
                </Nav.Item>
              </Link>
              <Link passHref href='/user'>
                <Nav.Item
                  eventKey='2'
                  active={this.pageActive('/user')}
                  icon={<S.User width='22' />}
                >
                  {/* {this.props.user.substr(0, this.props.user.indexOf('@'))} */}
                  My Requests
                </Nav.Item>
              </Link>
              <Dropdown
                eventKey='4'
                trigger='hover'
                title='Team'
                icon={<S.Team width='22' />}
                placement='rightStart'
                active={
                  typeof window !== 'undefined' &&
                  Router.pathname.includes('team')
                }
              >
                <Link passHref href='/team/dashboard'>
                  <Dropdown.Item
                    eventKey='4-1'
                    active={this.pageActive('/team/dashboard')}
                  >
                    Dashboard
                  </Dropdown.Item>
                </Link>
                <Link passHref href='/team/calendar'>
                  <Dropdown.Item
                    eventKey='4-2'
                    active={
                      typeof window !== 'undefined' &&
                      Router.pathname === '/team/calendar'
                    }
                  >
                    Calendar
                  </Dropdown.Item>
                </Link>
                {team === 'Technik' && (
                  <Link passHref href='/team/oncall'>
                    <Dropdown.Item
                      eventKey='4-3'
                      active={
                        typeof window !== 'undefined' &&
                        Router.pathname === '/team/oncall'
                      }
                    >
                      On Call
                    </Dropdown.Item>
                  </Link>
                )}
              </Dropdown>
              {this.props.admin ? (
                <Dropdown
                  eventKey='5'
                  trigger='hover'
                  title='Admin'
                  icon={<S.Settings width='22' />}
                  placement='rightStart'
                  activeKey={
                    typeof window !== 'undefined' &&
                    Router.pathname.includes('settings')
                  }
                  active={
                    typeof window !== 'undefined' &&
                    Router.pathname.includes('settings')
                  }
                >
                  <Link passHref href='/settings/admin'>
                    <Dropdown.Item
                      eventKey='5-1'
                      active={this.pageActive('/settings/admin')}
                    >
                      Settings
                    </Dropdown.Item>
                  </Link>
                  <Link passHref href='/settings/reports'>
                    <Dropdown.Item
                      eventKey='5-2'
                      active={
                        typeof window !== 'undefined' &&
                        Router.pathname === '/settings/reports'
                      }
                    >
                      Reports
                    </Dropdown.Item>
                  </Link>
                </Dropdown>
              ) : null}
            </Nav>
          </Sidenav.Body>
        </Sidenav>
        <NavToggle
          expand={this.props.expand}
          handleSignOut={this.onSignOutSubmit}
          token={this.props.token}
          onChange={this.props.handleToggle}
          toggleHelpModal={this.handleHelpModal}
        />
        <Modal
          enforceFocus
          size='xs'
          backdrop
          show={openHelpModal}
          onHide={this.handleHelpModal}
          style={{ marginTop: '150px' }}
        >
          <Modal.Header>
            <Modal.Title style={{ fontSize: '24px' }}>About</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  marginBottom: '20px',
                }}
              >
                <img width='64' src={NDOLogo} alt='Newtelco Logo Gray' />
                <div style={{ width: '150px', lineHeight: '1.4rem' }}>
                  {'Nico Domino'}
                  <br />
                  <b>ndomino[at]newtelco.de</b>
                  <br />
                  2019-2020 ©
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  position: 'absolute',
                  width: '100%',
                  bottom: '0',
                }}
              >
                <span>
                  <a href='https://newtelco.com/legal-notice/'>Legal</a>
                </span>
                <span>
                  <a href='https://newtelco.com/data-privacy-policy/'>
                    Privacy
                  </a>
                </span>
                <span>
                  <a href='https://opensource.org/licenses/mit-license.php'>
                    MIT License
                  </a>
                </span>
              </div>
            </p>
          </Modal.Body>
          <Modal.Footer style={{ display: 'flex', justifyContent: 'center' }}>
            {this.state.companyName}
          </Modal.Footer>
        </Modal>
        <style jsx>
          {`
            :global(.sidebar-wrapper) {
              width: ${this.props.expand ? '260px' : '56px'};
              box-shadow: 10px 0 10px 1px rgba(0, 0, 0, 0.1);
              z-index: 999;
            }
            :global(.header-img) {
              width: 40px !important;
              height: 40px !important;
            }
            :global(.sidenav-header) {
              justify-content: ${this.props.expand
                ? 'center'
                : 'flex-start'} !important;
              align-items: center;
            }
            :global(.rs-sidenav-default) {
              background-color: #fff;
            }
            :global(.rs-sidenav-header) {
              height: 56px !important;
            }
            :global(.rs-nav-item.rs-nav-item-active::before) {
              border-left: 3px solid #67b246;
              box-shadow: -2px 0px 16px 2px #67b246;
              position: absolute;
              content: '';
              height: 100%;
              width: 3px;
            }
            :global(.nav-toggle) {
              background-color: #f3f3f3 !important;
            }
            :global(.rs-modal-backdrop.in) {
              opacity: 0.8;
            }
            :global(.menu-hr) {
              border-top: 1px solid rgba(237, 237, 230, 0.9);
              width: 80%;
              margin: 0 auto;
            }
          `}
        </style>
      </Sidebar>
    )
  }
}

export default SidebarNT
