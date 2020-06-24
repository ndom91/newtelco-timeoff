import React from 'react'
import moment from 'moment-timezone'
import { ResponsiveSwarmPlot } from '@nivo/swarmplot'

class ResponsiveSwarmplot extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      plotData: [],
    }
  }

  componentDidMount() {
    const host = window.location.host
    const protocol = window.location.protocol
    const year = moment().format('YYYY') - 1
    fetch(`${protocol}//${host}/api/report/swarmplot?y=${year}`)
      .then(res => res.json())
      .then(data => {
        if (data.query) {
          this.setState({
            plotData: data.query,
          })
        }
      })
      .catch(err => console.error(err))
  }

  render() {
    const { plotData } = this.state
    return (
      <ResponsiveSwarmPlot
        data={plotData}
        groups={[
          'Technik',
          'Order',
          'Sales',
          'Empfang',
          'Billing',
          'Marketing',
        ]}
        groupBy='group'
        identity='id'
        value='date'
        valueScale={{ type: 'linear', min: 1, max: 12, reverse: false }}
        size={{ key: 'volume', values: [0, 24], sizes: [2, 40] }}
        label='name'
        spaceing={4}
        layout='vertical'
        forceStrength={4}
        isInteractive={false}
        simulationIterations={100}
        colors={{ scheme: 'set2' }}
        borderColor={{
          from: 'color',
          modifiers: [
            ['darker', 0.7],
            ['opacity', 0.3],
          ],
        }}
        margin={{ top: 20, right: 10, bottom: 40, left: 40 }}
        axisBottom={{
          orient: 'bottom',
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Teams',
          legendPosition: 'middle',
          legendOffset: 46,
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Month',
          legendPosition: 'middle',
          legendOffset: -36,
        }}
        animate={false}
      />
    )
  }
}

export default ResponsiveSwarmplot
