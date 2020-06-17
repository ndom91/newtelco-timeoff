import React from 'react'
import Layout from '../../components/layout/index'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../../components/requiredLogin'
import Comments from '../../components/comments'
import Subheader from '../../components/content-subheader'
// https://github.com/milesj/interweave/tree/master/packages/emoji-picker
// import InterweaveEmojiPicker from 'interweave-emoji-picker'
import {
  Container,
  Content,
  Panel,
  Header,
  Table
} from 'rsuite'

const { Column, HeaderCell, Cell } = Table

class Wrapper extends React.Component {
  static async getInitialProps({ res, req, query }) {
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

  constructor(props) {
    super(props)
    this.state = {
      team: [],
      teamName: '',
      teamLoading: true
    }
  }

  componentDidMount() {
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
              teamLoading: false,
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

  render() {
    const {
      team,
      teamName,
      teamLoading
    } = this.state

    if (this.props.session.user) {
      return (
        <Layout user={this.props.session.user.email} token={this.props.session.csrfToken}>
          <Subheader header='Team' subheader='Dashboard' />
          <Container className='container-wrapper'>
            <Panel className='user-panel' style={{ height: '100%' }}>
              {teamName
                ? <Comments user={this.props.session.user} length={2} team={this.state.teamName} />
                : <h4>Loading...</h4>}
            </Panel>
            <Panel className='team-panel' bordered>
              <Header className='team-header-text'>
                Team Members
              </Header>
              <Content>
                <Table autoHeight data={team} loading={teamLoading}>
                  <Column width={50} align='center'>
                    <HeaderCell>Id</HeaderCell>
                    <Cell dataKey='id' />
                  </Column>

                  <Column width={100}>
                    <HeaderCell>First Name</HeaderCell>
                    <Cell dataKey='fname' />
                  </Column>

                  <Column width={100}>
                    <HeaderCell>Last Name</HeaderCell>
                    <Cell dataKey='lname' />
                  </Column>

                  <Column width={200}>
                    <HeaderCell>Email</HeaderCell>
                    <Cell dataKey='email' />
                  </Column>
                </Table>
              </Content>
            </Panel>
          </Container>
          <style jsx>{`
            :global(.calendar-todo-list) {
              list-style: none;
              font-size: 0.7rem;
              text-align: left;
            }
            :global(.rs-calendar-table-cell-content) {
              font-size: 13px;
            }
            :global(.user-panel) {
              width: 48%;
              margin-right: 20px;
              overflow: visible;
            }
            :global(.team-panel) {
              width: 48%;
            }
            :global(.team-header-text) {
              font-size: 1.2rem;
              margin-bottom: 5px;
            }
            :global(.content-wrapper) {
              overflow-y:hidden;
            }
            :global(.container-wrapper) {
              flex-direction: row;
              justify-content: space-around;
              padding: 10px;
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
