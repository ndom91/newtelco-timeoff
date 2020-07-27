import React from 'react'
import Layout from '../../components/layout/index'
import Router from 'next/router'
// import dynamic from 'next/dynamic'
import { getSession } from 'next-auth/client'
import RequireLogin from '../../components/requiredLogin'
import Subheader from '../../components/content-subheader'
import { Container, Panel, Content } from 'rsuite'
import OnCall from '../../components/scheduler'

// const TuiCalendar = dynamic(
//   () => import('../../components/tuioncall'),
//   { ssr: false }
// )

class Wrapper extends React.Component {
  static async getInitialProps({ res, req, query }) {
    return {
      session: await getSession({ req }),
    }
  }

  render() {
    if (this.props.session) {
      return (
        <Layout
          user={this.props.session.user.email}
          token={this.props.session.csrfToken}
        >
          <Container>
            <Subheader header='Technik' subheader='On-Call Management' />
            <Panel bordered>
              <Content>
                {/* <TuiCalendar /> */}
                <OnCall csrfToken={this.props.session.csrfToken} />
              </Content>
            </Panel>
          </Container>
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}

export default Wrapper
