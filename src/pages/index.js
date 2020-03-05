import React from 'react'
import dynamic from 'next/dynamic'
import fetch from 'isomorphic-unfetch'
import Layout from '../components/layout/index'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../components/requiredLogin'
import DashStat from '../components/dashstat'
import Subheader from '../components/content-subheader'
import { Container, Content, Panel, Notification } from 'rsuite'

const Calendar = dynamic(() => import('../components/calendar'), {
  ssr: false
})

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
      returnTo: props.returnTo,
      dashboard: {
        thisYear: 0,
        total: 0,
        spent: 0,
        available: 0
      }
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

        fetch(
          `${protocol}//${host}/api/mail/response?h=${approvalHash}&a=${actionCode}&b=0`
        )
          .then((resp) => resp.json())
          .then((data) => {
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
          .catch((err) => console.error(err))
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
      const host = window.location.host
      const protocol = window.location.protocol
      fetch(
        `${protocol}//${host}/api/user/entries/dashboard?u=${encodeURIComponent(this.props.session.user.email)}`
      )
        .then((resp) => resp.json())
        .then((data) => {
          if (data.userEntries[0]) {
            const user = data.userEntries[0]
            this.setState({
              dashboard: {
                thisYear: user.jahresurlaubInsgesamt || 0,
                total: user.restjahresurlaubInsgesamt || 0,
                spent: user.jahresUrlaubAusgegeben || 0,
                available: user.resturlaubJAHR || 0
              }
            })
          }
        })
        .catch((err) => console.error(err))
    }
  }

  render () {
    const {
      dashboard
    } = this.state
    if (this.props.session.user) {
      return (
        <Layout
          user={this.props.session.user.email}
          token={this.props.session.csrfToken}
        >
          <Container>
            <Subheader
              header='Absence Management'
              subheader='Current Vacations'
            />
            <div className='stat-wrapper'>
              <Panel>
                <DashStat value={dashboard.thisYear} label='Earned this Year' />
              </Panel>
              <Panel>
                <DashStat value={dashboard.total} label='Total Available' />
              </Panel>
              <Panel>
                <DashStat value={dashboard.spent} label='Spent this Year' />
              </Panel>
              <Panel>
                <DashStat value={dashboard.available} label='Total Available' />
              </Panel>
            </div>
            <Panel bordered>
              <Content>
                <Calendar />
              </Content>
            </Panel>
          </Container>
          <style jsx>{`
            .stat-wrapper {
              display: flex;
              justify-content: space-around;
              max-height: 160px;
              margin-bottom: 20px;
            } 
            :global(.stat-wrapper > .rs-panel) {
              width: 260px;
              max-height: 150px;
              margin: 15px;
              border-radius: 20px;
              background: #ffffff;
              box-shadow:  20px 20px 60px #d9d9d9, 
                          -20px -20px 60px #ffffff;
            } 
            :global(.sstat-wrapper > .rs-panel:nth-child(1)) {
              background-color: #358772 !important;
            }
            :global(.sstat-wrapper > .rs-panel:nth-child(2)) {
              background-color: #592941 !important;
            }
            :global(.sstat-wrapper > .rs-panel:nth-child(3)) {
              background-color: #CF8051 !important;
            }
            :global(.sstat-wrapper > .rs-panel:nth-child(4)) {
              background-color: #C24C61 !important;
            }
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
