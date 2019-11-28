
import React from 'react'
import {
  Navbar,
  Container,
  Panel,
  Header,
  Content,
  Footer,
  FlexboxGrid,
  Col
} from 'rsuite'
import '../../style/newtelco-rsuite.less'

class Wrapper extends React.Component {
  render () {
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
                <Panel bordered>
                  {this.props.children}
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
  }
}

export default Wrapper
