
import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import '../style/calendar.less'

const Calendar = (props) => {
  return (
    <FullCalendar
      defaultView='dayGridMonth'
      height='parent'
      contentHeight='auto'
      googleCalendarApiKey={process.env.GOOGLE_CAL_APIKEY}
      events={{
        googleCalendarId: process.env.GOOGLE_CAL_ID
      }}
      plugins={[dayGridPlugin, googleCalendarPlugin]}
    />
  )
}

export default Calendar
