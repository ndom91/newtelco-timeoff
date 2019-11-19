import React, { Component } from 'react'
import { format, isValid } from 'date-fns'

export default class DateTimeField extends Component {
  render () {
    let dateTime
    if (isValid(new Date(this.props.node.data.maileingang))) {
      dateTime = format(new Date(this.props.node.data.maileingang), 'dd.MM.yyyy HH:mm')
    } else {
      dateTime = this.props.node.data.maileingang
    }
    return (
      <span>
        {dateTime}
      </span>
    )
  }
};
