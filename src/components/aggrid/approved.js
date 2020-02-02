import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faTimes,
  faUserClock
} from '@fortawesome/free-solid-svg-icons'

export default class ApprovedField extends Component {
  render () {
    if (this.props.value === 2) {
      return (
        <span title='Approved' style={{ color: '#67B246', fontSize: '16px' }}>
          <FontAwesomeIcon width='1.325em' icon={faCheck} />
        </span>
      )
    } else if (this.props.value === 0) {
      return (
        <span title='Waiting on Approval' style={{ color: '#ec7777', fontSize: '16px' }}>
          <FontAwesomeIcon width='1.325em' icon={faUserClock} />
        </span>
      )
    } else if (this.props.value === 1) {
      return (
        <span title='Denied' style={{ color: '#ec7777', fontSize: '16px' }}>
          <FontAwesomeIcon width='1.325em' icon={faTimes} />
        </span>
      )
    }
  }
};
