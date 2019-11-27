import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons'

export default class ApprovedField extends Component {
  render () {
    if (this.props.value === 2) {
      return (
        <span>
          <FontAwesomeIcon width='1.325em' icon={faCheck} />
        </span>
      )
    } else {
      return (
        <span>
          <FontAwesomeIcon width='1.325em' icon={faTimes} />
        </span>
      )
    }
  }
};
