import React, { Component } from "react"
import { format, isValid } from "date-fns"

export default class DateTimeField extends Component {
  render() {
    let dateTime
    if (this.props.value && isValid(new Date(this.props.value))) {
      dateTime = format(new Date(this.props.value), "dd.MM.yyyy HH:mm")
    } else {
      dateTime = (
        <svg
          width="1.325em"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    }
    return (
      <span
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "48px",
        }}
      >
        {dateTime}
      </span>
    )
  }
}
