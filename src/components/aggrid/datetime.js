import React, { Component } from 'react'
import { format, isValid } from 'date-fns'

export default class DateTimeField extends Component {
  render () {
    let dateTime
    if (isValid(new Date(this.props.value))) {
      dateTime = format(new Date(this.props.value), 'dd.MM.yyyy HH:mm')
    } else {
      dateTime = this.props.value
    }
    return (
      <span>
        {dateTime}
      </span>
    )
  }
};
