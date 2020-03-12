import React from 'react'
import fetch from 'isomorphic-unfetch'
import moment from 'moment-timezone'
import Chart from 'react-apexcharts'

class StackedBarChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      series: [{
        name: 'PRODUCT A',
        data: [44, 55, 41, 67, 22, 43]
      }, {
        name: 'PRODUCT B',
        data: [13, 23, 20, 8, 13, 27]
      }, {
        name: 'PRODUCT C',
        data: [11, 17, 15, 15, 21, 14]
      }, {
        name: 'PRODUCT D',
        data: [21, 7, 25, 13, 22, 8]
      }],
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
          type: 'datetime',
          categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT',
            '01/05/2011 GMT', '01/06/2011 GMT'
          ]
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
    const year = moment().format('YYYY') - 1
    fetch(`${protocol}//${host}/api/report/swarmplot?y=${year}`)
      .then(res => res.json())
      .then(data => {
        if (data.query) {
          this.setState({
            plotData: data.query
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
    return (
      <Chart options={options} series={series} type='bar' width={500} height={320} />
    )
  }
}

export default StackedBarChart
