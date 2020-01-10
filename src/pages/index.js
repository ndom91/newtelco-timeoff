import React from 'react'
import dynamic from 'next/dynamic'
import fetch from 'isomorphic-unfetch'
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
    if (req) {
      return {
        session: await NextAuth.init({ req }),
        returnTo: req.session.returnTo
      }
    } else {
      return {
        session: await NextAuth.init({ req })
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      returnTo: props.returnTo
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
      let params
      if (this.props.returnTo && !window.location.search) {
        const searchParams = `?${this.props.returnTo}`
        params = new URLSearchParams(searchParams)
        const approvalHash = params.get('h')
        const actionCode = params.get('a')
        const host = window.location.host
        const protocol = window.location.protocol

        fetch(`${protocol}//${host}/api/mail/response?h=${approvalHash}&a=${actionCode}&b=0`)
          .then(resp => resp.json())
          .then(data => {
            const code = data.code
            const action = data.a
            if (code === 200 && action === 'a') {
              this.notifyInfo('Absence Successfully Approved')
            } else if (code === 200 && action === 'd') {
              this.notifyInfo('Absence Successfully Denied')
            } else if (code === 500) {
              this.notifyWarn('Error Responding to Request')
            }
          })
          .catch(err => console.error(err))
      } else {
        const windowUrl = window.location.search
        params = new URLSearchParams(windowUrl)
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
