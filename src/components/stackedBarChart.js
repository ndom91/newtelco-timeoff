import React from 'react'
import fetch from 'isomorphic-unfetch'
import moment from 'moment-timezone'
import Chart from 'react-apexcharts'

class StackedBarChart extends React.Component {
  constructor (props) {
    super(props)
    const MONTHS = () => {
      const months = []
      const dateStart = moment()
      const dateEnd = moment().subtract(6, 'month')
      while (dateEnd.diff(dateStart, 'months') <= 0) {
        months.push(`${dateStart.format('MMM')} ${dateStart.format('YYYY')}`)
        dateStart.subtract(1, 'month')
      }
      return months
    }
    console.log(MONTHS())
    this.state = {
      series: [],
      options: {
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          toolbar: {
            show: true
          },
          zoom: {
            enabled: true
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0
            }
          }
        }],
        plotOptions: {
          bar: {
            horizontal: false
          }
        },
        xaxis: {
          type: 'category',
          categories: MONTHS()
        },
        legend: {
          position: 'right',
          offsetY: 40
        },
        fill: {
          opacity: 1
        }
      }
    }
  }

  componentDidMount () {
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/report/stackedbarchart`)
      .then(res => res.json())
      .then(data => {
        if (data.query) {
          const teamSeries = []
          const series = []
          const teams = Array.from(new Set(data.query.map(obj => JSON.stringify(({ group: obj.group }))))).map(JSON.parse)
          teams.forEach(team => {
            const teamData = data.query
              .filter(vaca => vaca.group === team.group)
              .sort((a, b) => {
                // if (a.year > b.year) return -1
                // else if (a.year < b.year) return 1
                // else {
                //   if (a.month > b.month) return -1
                //   else if (a.month < b.month) return 1
                //   else return 0
                // }
                return (a.year > b.year)
                  ? -1
                  : (a.year < b.year)
                    ? 1
                    : (a.month > b.month)
                      ? -1
                      : (a.month < b.month)
                        ? 1
                        : 0
              })
            teamSeries.push(teamData)
          })
          teamSeries.forEach(team => {
            const data = team.map(team => team.count)
            series.push({ data: data, name: team[0].group })
          })
          const newXAxis = teamSeries[0].map(month => `${month.month} ${month.year}`)
          const options = this.state.options
          options.xaxis.categories = newXAxis
          this.setState({
            series: series,
            options: options
          })
        }
      })
      .catch(err => console.error(err))
  }

  render () {
    const {
      options,
      series
    } = this.state
    return <Chart options={options} series={series} type='bar' width={600} height={320} />
  }
}

export default StackedBarChart
