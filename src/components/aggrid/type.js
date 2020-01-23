import React, { Component } from 'react'

export default class TypeField extends Component {
  render () {
    const type = this.props.value
    const returnType = type.charAt(0).toUpperCase() + type.slice(1)
    return (
      <span>
        {returnType}
      </span>
    )
  }
};
