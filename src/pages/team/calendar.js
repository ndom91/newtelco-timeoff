import React from 'react'
import Layout from '../../components/layout/index'
import Router from 'next/router'
import { NextAuth } from 'next-auth/client'
import RequireLogin from '../../components/requiredLogin'
import { getDate } from 'date-fns'
import {
  Container,
  Content,
  Calendar,
  Whisper,
  Popover,
  Badge
} from 'rsuite'

function getTodoList (date) {
  const day = getDate(date)

  switch (day) {
    case 10:
      return [
        { time: '10:30 am', title: 'Meeting' },
        { time: '12:00 pm', title: 'Lunch' }
      ]
    case 15:
      return [
        { time: '09:30 pm', title: 'Products Introduction Meeting' },
        { time: '12:30 pm', title: 'Client entertaining' },
        { time: '02:00 pm', title: 'Product design discussion' },
        { time: '05:00 pm', title: 'Product test and acceptance' },
        { time: '06:30 pm', title: 'Reporting' },
        { time: '10:00 pm', title: 'Going home to walk the dog' }
      ]
    default:
      return []
  }
}

function renderCell (date) {
  const list = getTodoList(date)
  const displayList = list.filter((item, index) => index < 2)

  if (list.length) {
    const moreCount = list.length - displayList.length
    const moreItem = (
      <li>
        <Whisper
          placement='top'
          trigger='click'
          speaker={
            <Popover>
              {list.map((item, index) => (
                <p key={index}>
                  <b>{item.time}</b> - {item.title}
                </p>
              ))}
            </Popover>
          }
        >
          <a>{moreCount} more</a>
        </Whisper>
      </li>
    )

    return (
      <ul className='calendar-todo-list'>
        {displayList.map((item, index) => (
          <li key={index}>
            <Badge /> <b>{item.time}</b> - {item.title}
          </li>
        ))}
        {moreCount ? moreItem : null}
      </ul>
    )
  }

  return null
}
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
            <Content>
              <Calendar bordered renderCell={renderCell} />
            </Content>
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
