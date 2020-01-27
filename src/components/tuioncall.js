import React from 'react'
import Calendar from '@toast-ui/react-calendar'
import 'tui-calendar/dist/tui-calendar.css'
import 'tui-date-picker/dist/tui-date-picker.css'
import 'tui-time-picker/dist/tui-time-picker.css'
import fetch from 'isomorphic-unfetch'
import { Container, Header, IconButton, ButtonGroup, Icon } from 'rsuite'

// https://github.com/nhn/toast-ui.react-calendar
// https://nhn.github.io/tui.calendar/latest/tutorial-example00-basic

class TuiCalendar extends React.Component {
  constructor (props) {
    super(props)
    this.calendarRef = React.createRef()

    this.state = {
      teamSchedules: [],
      currentView: 'month',
      schedules: []
    }
  }

  componentDidMount () {
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/team/oncall`)
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
    const calendarInstance = this.calendarRef.current.getInstance()
    const monthHeader = this.getMonthHeader(calendarInstance.getDateRangeStart(), calendarInstance.getDateRangeEnd())
    this.setState({
      currentDateView: calendarInstance.getDate(),
      monthHeader
    })
  }

  getMonthHeader = (dateA, dateB) => {
    const monthA = new Date(dateA._date).toLocaleString('default', { month: 'long' })
    const monthB = new Date(dateB._date).toLocaleString('default', { month: 'long' })
    if (monthA === monthB) {
      return monthA
    } else {
      return `${monthA} - ${monthB}`
    }
  }

  handleToggleView = () => {
    const {
      currentView
    } = this.state

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

  handleMoveToToday = () => {
    const calendarInstance = this.calendarRef.current.getInstance()
    calendarInstance.today()
  }

  handleCalendarNext = () => {
    const calendarInstance = this.calendarRef.current.getInstance()
    console.log(calendarInstance)
    calendarInstance.next()
    const monthHeader = this.getMonthHeader(calendarInstance.getDateRangeStart(), calendarInstance.getDateRangeEnd())
    this.setState({
      currentDateView: calendarInstance.getDate(),
      monthHeader
    })
  }

  handleCalendarPrev = () => {
    const calendarInstance = this.calendarRef.current.getInstance()
    const monthHeader = this.getMonthHeader(calendarInstance.getDateRangeStart(), calendarInstance.getDateRangeEnd())
    calendarInstance.prev()
    this.setState({
      currentDateView: calendarInstance.getDate(),
      monthHeader
    })
  }

  handleScheduleClick = (data) => {
    console.log(data)
  }

  handleScheduleAdd = (data) => {
    console.log(data)
    const startTime = data.start
    const endTime = data.end
    const isAllDay = data.isAllDay
    const guide = data.guide
    const triggerEventName = data.triggerEventName
    const schedule = {
      calendarId: data.calendarId,
      title: data.title,
      category: 'On Call',
      start: startTime,
      end: endTime,
      isAllDay: isAllDay
    }

    const calendarInstance = this.calendarRef.current.getInstance()
    calendarInstance.createSchedules([schedule])
  }

  render () {
    const {
      currentView,
      monthHeader
    } = this.state

    return (
      <Container>
        <Header className='calendar-header'>
          <span
            style={{
              fontSize: '24px'
            }}
          >
            {monthHeader}
          </span>
          <span>
            <ButtonGroup style={{ marginRight: '10px' }}>
              <IconButton
                icon={<Icon size='4x' icon='calendar' />}
                onClick={this.handleCreateNewSchedule}
                appearance='ghost'
                size='lg'
              >
                Create New
              </IconButton>
            </ButtonGroup>
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
          style={{
            zIndex: '9999'
          }}
          ref={this.calendarRef}
          calendars={[
            {
              id: '069',
              name: 'Driving',
              bgColor: '#67B246',
              borderColor: '#9e5fff'
            },
            {
              id: '070',
              name: 'On-Call',
              bgColor: '#efefef',
              borderColor: '#9e5fff'
            }
          ]}
          height='100%'
          month={{
            startDayOfWeek: 0,
            narrowWeekend: true,
            visibleWeeksCount: 3
          }}
          taskView={false}
          // scheduleView={['allday']}
          useCreationPopup
          useDetailPopup
          timezones={[
            {
              timezoneOffset: 60,
              displayLabel: 'GMT+01:00',
              tooltip: 'Berlin'
            }
          ]}
          onBeforeCreateSchedule={this.handleScheduleAdd}
          onBeforeUpdateSchedule={this.handleScheduleAdd}
          // onClickDay={this.handleScheduleClick}
          // onClickDayname={this.handleScheduleClick}
          // template={{
          //   milestone (schedule) {
          //     return `<span style="color:#fff;background-color: ${schedule.bgColor};">${
          //       schedule.title
          //     }</span>`
          //   },
          //   milestoneTitle () {
          //     return 'Milestone'
          //   },
          //   allday (schedule) {
          //     return `${schedule.title}<i class="fa fa-refresh"></i>`
          //   },
          //   alldayTitle () {
          //     return 'All Day'
          //   }
          // }}
          // schedules={this.state.schedules}
        />
        <style jsx global>{`
            .calendar-header {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            :global(.rs-panel) {
              overflow: visible;
            }
          `}
        </style>
      </Container>
    )
  }
}

export default TuiCalendar
