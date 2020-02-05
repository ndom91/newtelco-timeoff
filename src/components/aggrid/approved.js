import React, { Component } from 'react'
import {
  Tag
} from 'rsuite'

export default class ApprovedField extends Component {
  render () {
    if (this.props.value === 2) {
      return (
        <span title='Approved' className='tag-wrapper' style={{ color: '#67B246', fontSize: '16px' }}>
          <Tag color='green'>Approved</Tag>
        </span>
      )
    } else if (this.props.value === 0) {
      return (
        <span title='Waiting on Approval' className='tag-wrapper' style={{ color: '#ec7777', fontSize: '16px' }}>
          <Tag color='orange'>Waiting</Tag>
        </span>
      )
    } else if (this.props.value === 1) {
      return (
        <span title='Denied' className='tag-wrapper' style={{ color: '#ec7777', fontSize: '16px' }}>
          <Tag color='red'>Denied</Tag>
        </span>
      )
    }
  }
};
