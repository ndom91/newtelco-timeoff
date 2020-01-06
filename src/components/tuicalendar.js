import React from 'react'
import Calendar from '@toast-ui/react-calendar'
import 'tui-calendar/dist/tui-calendar.css'
import 'tui-date-picker/dist/tui-date-picker.css'
import 'tui-time-picker/dist/tui-time-picker.css'
import fetch from 'isomorphic-unfetch'
import { Container, Header, Button, IconButton, ButtonGroup, Icon, ButtonToolbar } from 'rsuite'

// https://github.com/nhn/toast-ui.react-calendar

class TuiCalendar extends React.Component {
  constructor (props) {
    super(props)
    this.calendarRef = React.createRef()

    this.state = {
      teamSchedules: [],
      currentView: 'month'
    }
  }

  componentDidMount () {
    const host = window.location.host
    const protocol = window.location.protocol
    const team = 'Technik'
    fetch(`${protocol}//${host}/api/team/cal?t=${team}`)
      .then(res => res.json())
      .then(data => {
        if (data.userEntries) {
          this.setState({
            rowData: data.userEntries
          })
          window.gridApi && window.gridApi.refreshCells()
        }
      })
      .catch(err => console.error(err))
  }

  handleToggleView = () => {
    const {
      currentView
    } = this.state

    console.log(this.calendarRef)
    const calendarInstance = this.calendarRef.current.getInstance()
    if (currentView === 'month') {
      calendarInstance.changeView('week', true)
      this.setState({
        currentView: 'week'
      })
    } else {
      calendarInstance.changeView('month', true)
      this.setState({
        currentView: 'month'
      })
    }
  }

  render () {
    const {
      currentView
    } = this.state

    return (
      <Container>
        <Header className='calendar-header'>
          <span
            style={{
              fontSize: '24px'
            }}
          >
            {this.props.teamName} Calendar
          </span>
          <ButtonGroup>
            <IconButton
              icon={<Icon icon='calendar' />}
              onClick={this.handleToggleView}
              appearance='primary'
            >
              Toggle View
            </IconButton>
          </ButtonGroup>
        </Header>
        <Calendar
          ref={this.calendarRef}
          calendars={[
            {
              id: '0',
              name: 'Private',
              bgColor: '#9e5fff',
              borderColor: '#9e5fff'
            }
          ]}
          disableDblClick
          disableClick={false}
          isReadOnly
          height='100%'
          month={{
            startDayOfWeek: 0,
            narrowWeekend: true,
            visibleWeeksCount: 3
          }}
          taskView={false}
          defaultView={currentView}
          view={currentView}
          timezones={[
            {
              timezoneOffset: 60,
              displayLabel: 'GMT+01:00',
              tooltip: 'Berlin'
            }
          ]}
          schedules={[
            {
              id: '1',
              calendarId: '0',
              title: 'TOAST UI Calendar Study',
              category: 'time',
              dueDateClass: '',
              start: '2020-01-05T14:48:00.000Z',
              end: '2020-01-06T14:48:00.000Z'
            },
            {
              id: '2',
              calendarId: '0',
              title: 'Practice',
              category: 'milestone',
              dueDateClass: '',
              start: '2020-01-05T09:48:00.000Z',
              end: '2020-01-06T10:48:00.000Z',
              isReadOnly: true
            },
            {
              id: '3',
              calendarId: '0',
              title: 'FE Workshop',
              category: 'allday',
              dueDateClass: '',
              start: '2020-01-07T09:48:00.000Z',
              end: '2020-01-08T10:48:00.000Z',
              isReadOnly: true
            },
            {
              id: '4',
              calendarId: '0',
              title: 'Report',
              category: 'time',
              dueDateClass: '',
              start: '2020-01-08T09:48:00.000Z',
              end: '2020-01-09T10:48:00.000Z'
            }
          ]}
        />
        <style jsx global>{`
            .calendar-header {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
          `}
        </style>
      </Container>
    )
  }
}

export default TuiCalendar
