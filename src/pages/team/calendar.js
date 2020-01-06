import React from 'react'
import Layout from '../../components/layout/index'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
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

  constructor (props) {
    super(props)

    this.state = {
      teamName: ''
    }
  }

  componentDidMount () {
    const protocol = window.location.protocol
    const host = window.location.host
    const team = JSON.parse(window.localStorage.getItem('userTeam'))
    if (team.team) {
      fetch(`${protocol}//${host}/api/settings/team/members?team=${team.team}`)
        .then(res => res.json())
        .then(data => {
          if (data.teamMembers) {
            const teamMembers = data.teamMembers.filter(member => {
              if (member.lname !== 'Cleese' &&
                member.lname !== 'Device') {
                return member
              }
            })
            this.setState({
              team: teamMembers
            })
          }
        })
        .catch(err => console.error(err))

      this.setState({
        teamName: team.team
      })
    }
  }

  render () {
    const {
      teamName
    } = this.state

    if (this.props.session.user) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <Container>
            <Content>
              {typeof window !== 'undefined' && <TuiCalendar teamName={teamName} />}
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
