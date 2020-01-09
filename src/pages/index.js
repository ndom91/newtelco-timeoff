import React from 'react'
import dynamic from 'next/dynamic'
import Layout from '../components/layout/index'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
import {
  Container,
  Content,
  Panel,
  Notification
} from 'rsuite'

const Calendar = dynamic(
  () => import('../components/calendar'),
  {
    ssr: false
  }
)

class Wrapper extends React.Component {
  static async getInitialProps ({ res, req, query }) {
    // if (process.browser) {
    //   return __NEXT_DATA__.props.pageProps
    // }
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

  notifyInfo = (header, text) => {
    Notification.info({
      title: header,
      duration: 5000,
      description: <div className='notify-body'>{text}</div>
    })
  }

  notifyWarn = (header, text) => {
    Notification.warning({
      title: header,
      duration: 5000,
      description: <div className='notify-body'>{text}</div>
    })
  }

  componentDidMount () {
    if (typeof window !== 'undefined') {
      const windowUrl = window.location.search
      const params = new URLSearchParams(windowUrl)
      const action = params.get('a')
      const code = params.get('code')
      if (code === '200' && action === 'a') {
        this.notifyInfo('Absence Successfully Approved')
      } else if (code === '200' && action === 'd') {
        this.notifyInfo('Absence Successfully Denied')
      } else if (code === '500') {
        this.notifyWarn('Error Responding to Request')
      }
    }
  }

  render () {
    if (this.props.session.user) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <Container>
            <Panel bordered>
              <Content>
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
