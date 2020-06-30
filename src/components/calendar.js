import React from 'react'
import CustomStore from 'devextreme/data/custom_store'
import Scheduler from 'devextreme-react/scheduler'

function getData(_, requestOptions) {
  const PUBLIC_KEY = process.env.GOOGLE_CAL_APIKEY
  const CALENDAR_ID = process.env.GOOGLE_CAL_ID

  const host = window.location.host
  const protocol = window.location.protocol
  return fetch(`${protocol}//${host}/api/report/cal`)
    .then(res => res.json())
    .then(data => data.companyVacations)
}

const RCalendar = props => {
  const dataSource = new CustomStore({
    load: options => getData(options, { showDeleted: false }),
  })

  const currentDate = new Date()
  const views = [
    {
      type: 'month',
      name: 'Month',
      maxAppointmentsPerCell: 3,
    },
  ]

  return (
    <>
      <Scheduler
        dataSource={dataSource}
        views={views}
        showCurrentTimeIndicator
        defaultCurrentView='month'
        defaultCurrentDate={currentDate}
        height={600}
        startDayHour={7}
        editing={false}
        showAllDayPanel={false}
        timeZone='Europe/Berlin'
      />
    </>
  )
}

export default RCalendar
