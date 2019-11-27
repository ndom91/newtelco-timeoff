import React, { Component } from 'react'
import { format, isValid } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock
} from '@fortawesome/free-solid-svg-icons'

export default class DateTimeField extends Component {
  render () {
    let dateTime
    if (this.props.value && isValid(new Date(this.props.value))) {
      dateTime = format(new Date(this.props.value), 'dd.MM.yyyy HH:mm')
    } else {
      dateTime = <FontAwesomeIcon width='1.325em' icon={faClock} />
    }
    return (
      <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px' }}>
        {dateTime}
      </span>
    )
  }
};
