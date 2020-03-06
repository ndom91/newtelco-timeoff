import React, { Component } from 'react'

export default class DateField extends Component {
  render() {
    const props = this.props
    const value = this.props.value
    let dateTime
    if (props.value && !isNaN(Date.parse(props.value))) {
      const dateAr = value.split('.')
      const day = dateAr[0]
      const month = dateAr[1]
      const year = dateAr[2]
      dateTime = `${day}.${month}.${year}`
    } else {
      dateTime = props.value
    }
    return (
      <span>
        {dateTime}
      </span>
    )
  }
};
