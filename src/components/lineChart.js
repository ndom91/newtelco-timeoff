import React from "react"
import moment from "moment-timezone"
import Chart from "react-apexcharts"

class StackedBarChart extends React.Component {
  constructor(props) {
    super(props)
    const MONTHS = () => {
      const months = []
      const dateStart = moment()
      const dateEnd = moment().subtract(12, "month")
      while (dateEnd.diff(dateStart, "months") <= 0) {
        months.push(`${dateStart.format("MMM")} ${dateStart.format("YYYY")}`)
        dateStart.subtract(1, "month")
      }
      return months
    }
    this.state = {
      series: [],
      options: {
        chart: {
          type: "area",
          height: 350,
          stacked: true,
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              legend: {
                position: "bottom",
                offsetX: -10,
                offsetY: 0,
              },
            },
          },
        ],
        plotOptions: {
          bar: {
            horizontal: false,
          },
        },
        xaxis: {
          type: "category",
          categories: MONTHS(),
        },
        legend: {
          position: "right",
          offsetY: 40,
        },
        fill: {
          opacity: 1,
        },
      },
    }
  }

  componentDidMount() {
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/report/stackedbarchart`)
      .then((res) => res.json())
      .then((data) => {
        if (data.query.length > 0) {
          const teamSeries = []
          const series = []
          const teams = Array.from(
            /* eslint-disable-next-line */
            new Set(
              data.query.map((obj) => {
                return obj.group
              })
            )
          )
          teams.forEach((team) => {
            const teamData = data.query
              .filter((vaca) => vaca.group === team)
              .sort((a, b) => {
                // if (a.year > b.year) return -1
                // else if (a.year < b.year) return 1
                // else {
                //   if (a.month > b.month) return -1
                //   else if (a.month < b.month) return 1
                //   else return 0
                // }
                return a.year > b.year
                  ? -1
                  : a.year < b.year
                  ? 1
                  : a.month > b.month
                  ? -1
                  : a.month < b.month
                  ? 1
                  : 0
              })
            teamSeries.push(teamData)
          })
          teamSeries.forEach((team) => {
            const data = team.map((team) => team.count)
            if (data.length < 12) {
              const missingData = 12 - data.length
              Array.from(Array(missingData)).forEach(() => {
                data.push(0)
              })
            }
            series.push({ data: data, name: team[0].group })
          })
          this.setState({
            series: series,
          })
        }
      })
      .catch((err) => console.error(err))
  }

  render() {
    const { options, series } = this.state
    if (series.length > 0) {
      return (
        <Chart
          options={options}
          series={series}
          width={600}
          height={320}
          type="area"
        />
      )
    } else {
      return <div>Loading...</div>
    }
  }
}

export default StackedBarChart
