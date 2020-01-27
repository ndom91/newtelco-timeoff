
import React from 'react'
import {
  Container,
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
          <Content className='login-content-wrapper'>
            <FlexboxGrid style={{ marginTop: '2rem' }} justify='center'>
              <FlexboxGrid.Item componentClass={Col} colspan={26} md={10} lg={10}>
                {this.props.children}
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
              background-color: #67b246;
              color: #fff;
            }
            :global(.rs-panel-body) {
              background-color: #fff;
            }
            :global(.rs-panel-bordered) {
              margin-top: 50px;
              box-shadow: 0 2px 0 rgba(90,97,105,.11), 0 4px 8px rgba(90,97,105,.12), 0 10px 10px rgba(90,97,105,.06), 0 7px 70px rgba(90,97,105,.1);
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
            :global(.login-header-wrapper) {

            }
            :global(.login-content-wrapper) {
              background-color: #f5f6f8;
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
          `}
        </style>
      </div>
    )
  }
}

export default Wrapper
