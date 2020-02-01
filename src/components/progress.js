import React from 'react'
import { Progress } from 'rsuite'
const { Line } = Progress

export default class ProgressBar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  getLineStatus = progress => {
    if (typeof progress === 'string') {
      if (progress === 'error') {
        return 'fail'
      }
      return 'active'
    } else {
      if (progress === 100) {
        return 'success'
      }
      return 'active'
    }
  }

  render () {
    return (
      <div className='ProgressBar'>
        {/* <div
          className='Progress'
          style={{ width: this.props.progress + '%' }}
        /> */}
        <Line progress={this.props.progress} status={() => this.getLineStatus(this.props.progress)} />
        <style jsx>{`
          .ProgressBar {
            width: 100%;
            height: 8px;
            background-color: rgb(183, 155, 229);
            border-radius: 5px;
          }
          .Progress {
            background-color: rgba(103, 58, 183, 1);
            height: 100%;
            margin: 0;
            border-radius: 5px;
          }
        `}
        </style>
      </div>
    )
  }
}
