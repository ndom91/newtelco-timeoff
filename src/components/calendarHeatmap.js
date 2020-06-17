import React from 'react'
import Moment from 'moment-timezone'
import { extendMoment } from 'moment-range'
import CalendarHeatmap from 'reactjs-calendar-heatmap'

const moment = extendMoment(Moment)

class Calendar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      heatmapData: [],
    }
  }

  componentDidMount() {
    const host = window.location.host
    const protocol = window.location.protocol
    const user = this.props.user
    fetch(`${protocol}//${host}/api/user/entries?user=${user}`)
      .then(res => res.json())
      .then(data => {
        if (data.userEntries) {
          const heatmap = []
          this.setState({
            rowData: data.userEntries,
          })
          data.userEntries.forEach(entry => {
            const from = moment(entry.from)
            const to = moment(entry.to)
            const range = moment.range(from, to)
            for (const day of range.by('day')) {
              heatmap.push({ date: day, value: 1 })
            }
            // https://www.npmjs.com/package/reactjs-calendar-heatmap
          })
          this.setState({
            heatmapData: heatmap,
          })
        }
      })
      .catch(err => console.error(err))
  }

  render() {
    const { heatmapData } = this.state

    var hData = [
      {
        date: '2016-01-01',
        total: 17164,
        details: [
          {
            name: 'Project 1',
            date: '2016-01-01 12:30:45',
            value: 9192,
          },
          {
            name: 'Project 2',
            date: '2016-01-01 13:37:00',
            value: 6753,
          },
          {
            name: 'Project N',
            date: '2016-01-01 17:52:41',
            value: 1219,
          },
        ],
      },
    ]

    return (
      <CalendarHeatmap
        // data={heatmapData}
        data={hData}
        color='#67b246'
        overview='year'
      />
    )
  }
}

export default Calendar
