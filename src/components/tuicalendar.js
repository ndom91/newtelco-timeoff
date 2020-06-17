import React from 'react'
import Calendar from '@toast-ui/react-calendar'
import 'tui-calendar/dist/tui-calendar.css'
import 'tui-date-picker/dist/tui-date-picker.css'
import 'tui-time-picker/dist/tui-time-picker.css'
import {
  Container,
  Header,
  Button,
  IconButton,
  ButtonGroup,
  Icon,
  ButtonToolbar,
} from 'rsuite'

// https://github.com/nhn/toast-ui.react-calendar

class TuiCalendar extends React.Component {
  constructor(props) {
    super(props)
    this.calendarRef = React.createRef()

    this.state = {
      teamSchedules: [],
      currentView: 'month',
    }
  }

  componentDidMount() {
    const host = window.location.host
    const protocol = window.location.protocol
    const team = 'Technik'
    fetch(`${protocol}//${host}/api/team/cal?t=${team}`)
      .then(res => res.json())
      .then(data => {
        if (data.userEntries) {
          this.setState({
            rowData: data.userEntries,
          })
          window.gridApi && window.gridApi.refreshCells()
        }
      })
      .catch(err => console.error(err))
    const calendarInstance = this.calendarRef.current.getInstance()
    const monthHeader = this.getMonthHeader(
      calendarInstance.getDateRangeStart(),
      calendarInstance.getDateRangeEnd()
    )
    this.setState({
      currentDateView: calendarInstance.getDate(),
      monthHeader,
    })
  }

  getMonthHeader = (dateA, dateB) => {
    const monthA = new Date(dateA._date).toLocaleString('default', {
      month: 'long',
    })
    const monthB = new Date(dateB._date).toLocaleString('default', {
      month: 'long',
    })
    if (monthA === monthB) {
      return monthA
    } else {
      return `${monthA} - ${monthB}`
    }
  }

  handleToggleView = () => {
    const { currentView } = this.state

    const calendarInstance = this.calendarRef.current.getInstance()
    if (currentView === 'month') {
      calendarInstance.changeView('week', true)
      this.setState({
        currentView: 'week',
      })
    } else {
      calendarInstance.changeView('month', true)
      this.setState({
        currentView: 'month',
      })
    }
  }

  handleMoveToToday = () => {
    const calendarInstance = this.calendarRef.current.getInstance()
    calendarInstance.today()
  }

  handleCalendarNext = () => {
    const calendarInstance = this.calendarRef.current.getInstance()
    calendarInstance.next()
    const monthHeader = this.getMonthHeader(
      calendarInstance.getDateRangeStart(),
      calendarInstance.getDateRangeEnd()
    )
    this.setState({
      currentDateView: calendarInstance.getDate(),
      monthHeader,
    })
  }

  handleCalendarPrev = () => {
    const calendarInstance = this.calendarRef.current.getInstance()
    const monthHeader = this.getMonthHeader(
      calendarInstance.getDateRangeStart(),
      calendarInstance.getDateRangeEnd()
    )
    calendarInstance.prev()
    this.setState({
      currentDateView: calendarInstance.getDate(),
      monthHeader,
    })
  }

  render() {
    const { currentView, monthHeader } = this.state

    return (
      <Container>
        <Header className='calendar-header'>
          <span
            style={{
              fontSize: '24px',
            }}
          >
            {this.props.teamName} Absences
          </span>
          <span
            style={{
              fontSize: '24px',
            }}
          >
            {monthHeader}
          </span>
          <span>
            <ButtonGroup style={{ marginRight: '10px' }}>
              <IconButton
                icon={<Icon size='4x' icon='calendar' />}
                onClick={this.handleMoveToToday}
                appearance='ghost'
                size='lg'
              >
                Today
              </IconButton>
            </ButtonGroup>
            <ButtonGroup style={{ marginRight: '10px' }}>
              <IconButton
                icon={<Icon size='4x' icon='calendar' />}
                onClick={this.handleToggleView}
                appearance='ghost'
                size='lg'
              >
                Toggle View
              </IconButton>
            </ButtonGroup>
            <ButtonGroup>
              <IconButton
                icon={<Icon icon='chevron-left' />}
                onClick={this.handleCalendarPrev}
                appearance='primary'
                size='lg'
              />
              <IconButton
                icon={<Icon size='4x' icon='chevron-right' />}
                onClick={this.handleCalendarNext}
                appearance='primary'
                size='lg'
              />
            </ButtonGroup>
          </span>
        </Header>
        <Calendar
          ref={this.calendarRef}
          calendars={[
            {
              id: '069',
              name: 'Private',
              bgColor: '#67B246',
              borderColor: '#9e5fff',
            },
          ]}
          disableDblClick
          disableClick={false}
          isReadOnly
          height='100%'
          month={{
            startDayOfWeek: 0,
            narrowWeekend: true,
            visibleWeeksCount: 3,
          }}
          taskView={false}
          defaultView={currentView}
          view={currentView}
          timezones={[
            {
              timezoneOffset: 60,
              displayLabel: 'GMT+01:00',
              tooltip: 'Berlin',
            },
          ]}
          schedules={this.props.vacations}
        />
        <style jsx global>
          {`
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
