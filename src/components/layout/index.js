import React from 'react'
import Link from 'next/link'
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

const headerStyles = {
  padding: 18,
  fontSize: 16,
  height: 56,
  background: '#67B246',
  color: ' #fff',
  whiteSpace: 'nowrap',
  overflow: 'hidden'
}

const iconStyles = {
  width: 56,
  height: 56,
  lineHeight: '56px',
  textAlign: 'center'
}

const NavToggle = ({ expand, onChange }) => {
  return (
    <Navbar appearance='subtle' className='nav-toggle'>
      <Navbar.Body>
        <Nav>
          <Dropdown
            placement='topStart'
            trigger='click'
            renderTitle={children => {
              return <Icon style={iconStyles} icon='cog' />
            }}
          >
            <Dropdown.Item>Help</Dropdown.Item>
            <Dropdown.Item>Settings</Dropdown.Item>
            <Dropdown.Item>Sign out</Dropdown.Item>
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
      expand: true,
      settings: {
        companyName: ''
      }
    }
    this.handleToggle = this.handleToggle.bind(this)
  }

  componentDidMount () {
    const host = window.location.host
    const companyInfo = JSON.parse(window.localStorage.getItem('company'))
    if (companyInfo) {
      this.setState({
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

  handleToggle () {
    this.setState({
      expand: !this.state.expand
    })
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
              <div style={headerStyles}>
                <img src={NTLogo} alt='Logo' style={{ height: '32px', width: '32px', marginTop: '-5px', marginLeft: '-5px' }} />
                <span style={{ marginLeft: 12 }}>{this.state.settings.companyName}</span>
              </div>
            </Sidenav.Header>
            <Sidenav
              expanded={expand}
              defaultOpenKeys={['3', '4']}
              appearance='subtle'
            >
              <Sidenav.Body>
                <Nav>
                  <Link href='/dashboard'>
                    <Nav.Item eventKey='1' active icon={<Icon icon='dashboard' />}>
                        Dashboard
                    </Nav.Item>
                  </Link>
                  <Link href='/user'>
                    <Nav.Item eventKey='2' icon={<Icon icon='group' />}>
                      User
                    </Nav.Item>
                  </Link>
                  <Dropdown
                    eventKey='3'
                    trigger='hover'
                    title='Team'
                    icon={<Icon icon='magic' />}
                    placement='rightStart'
                  >
                    <Dropdown.Item eventKey='3-1'>Dashboard</Dropdown.Item>
                    <Dropdown.Item eventKey='3-2'>Calendar</Dropdown.Item>
                  </Dropdown>
                  <Dropdown
                    eventKey='4'
                    trigger='hover'
                    title='Settings'
                    icon={<Icon icon='gear-circle' />}
                    placement='rightStart'
                  >
                    <Dropdown.Item eventKey='4-1'>General</Dropdown.Item>
                    <Dropdown.Item eventKey='4-2'>Admin</Dropdown.Item>
                  </Dropdown>
                </Nav>
              </Sidenav.Body>
            </Sidenav>
            <NavToggle expand={expand} onChange={this.handleToggle} />
          </Sidebar>
          <Container>
            <Header>
              <div className='header-wrapper'>
                <span>TITLE</span>
                <span>
                  <Breadcrumb style={{ marginBottom: '0px' }}>
                    <Breadcrumb.Item>Home</Breadcrumb.Item>
                    <Breadcrumb.Item>Components</Breadcrumb.Item>
                    <Breadcrumb.Item active>Breadcrumb</Breadcrumb.Item>
                  </Breadcrumb>
                </span>
              </div>
            </Header>
            <Content className='content-wrapper'>
              {this.props.children}
            </Content>
            <Footer className='footer-wrapper'>
              Footer
            </Footer>
          </Container>
        </Container>
        <style jsx>{`
          :global(.header-wrapper) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
          }
          :global(.content-wrapper) {
            padding: 20px;
          }
          :global(.footer-wrapper) {
            height: 56px;
            display: flex;
            align-items: center;
            padding: 10px;
          }
          :global(.wrapper, .rs-container-has-sidebar) {
            height: 100vh;
          }
          :global(.rs-sidenav) {
            flex-grow: 1;
          }
        `}
        </style>
      </div>
    )
  }
}

export default Layout
