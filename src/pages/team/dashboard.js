import React from 'react'
import Layout from '../../components/layout/index'
import Router from 'next/router'
import dynamic from 'next/dynamic'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../../components/requiredLogin'
import {
  Container,
  Header,
  Content
} from 'rsuite'

const TuiCalendar = dynamic(
  () => import('../../components/tuicalendar'),
  { ssr: false }
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
        <Layout token={this.props.session.csrfToken}>
          <Container>
            <Header>
              Lorem Ipsum
            </Header>
            <Content>
              {typeof window !== 'undefined' && <TuiCalendar />}
            </Content>
          </Container>
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}

export default Wrapper
