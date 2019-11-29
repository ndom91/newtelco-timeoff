import React, { Component } from 'react'
import { format, isValid } from 'date-fns'

export default class DateField extends Component {
  render () {
    let dateTime
    if (this.props.value && isValid(new Date(this.props.value))) {
      dateTime = format(new Date(this.props.value), 'dd.MM.yyyy')
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
