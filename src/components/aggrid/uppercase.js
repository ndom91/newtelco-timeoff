import React from 'react'

export default class DateField extends React.Component {
  render () {
    const type = this.props.value
    let typeReturn = ''
    if (type) {
      typeReturn = type[0].toUpperCase() + type.substring(1)
    }
    return (
      <span>
        {typeReturn}
      </span>
    )
  }
};
