import React from 'react'
import dynamic from 'next/dynamic'
import Layout from '../components/layout/index'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
import {
  Container,
  Content,
  Panel
} from 'rsuite'

const Calendar = dynamic(
  () => import('../components/calendar'),
  {
    ssr: false
  }
)

class Wrapper extends React.Component {
  static async getInitialProps ({ res, req, query }) {
    if (req && !req.user) {
      if (res) {
        res.writeHead(302, {
          Location: '/auth'
        })
        res.end()
      } else {
        Router.push('/auth')
      }
    }
    return {
      session: await NextAuth.init({ req })
    }
  }

  render () {
    if (this.props.session.user) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <Container>
            <Panel bordered>
              <Content>
                {/* <Calendar bordered renderCell={renderCell} /> */}
                <Calendar />
              </Content>
            </Panel>
          </Container>
          <style jsx>{`
          `}
          </style>
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}

export default Wrapper
