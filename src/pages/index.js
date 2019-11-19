import React from 'react'
import Layout from '../components/layout/index'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
// import { faSearch } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import Link from 'next/link'
import {
  Dropdown,
  Icon,
  Container,
  Header,
  Content,
  Footer
} from 'rsuite'

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
        <Layout>
          <Container>
            <Header>
              Dashboard
            </Header>
            <Content>
              [GRAPHICS]
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
