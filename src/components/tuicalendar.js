import React from 'react'
import Calendar from '@toast-ui/react-calendar'
import 'tui-calendar/dist/tui-calendar.css'
import fetch from 'isomorphic-unfetch'

// https://nicedoc.io/nhn/toast-ui.react-calendar#user-content--install

class TuiCalendar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      teamSchedules: []
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

  render () {
    return (
      <Calendar
        height='auto'
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
        month={{
          startDayOfWeek: 0
        }}
        defaultView='month'
        timezones={[
          {
            timezoneOffset: 60,
            displayLabel: 'GMT+01:00',
            tooltip: 'Berlin'
          }
        ]}
      />
    )
  }
}

export default TuiCalendar
