import React, { Component } from "react"
import { Button, ButtonGroup, ButtonToolbar, Tag } from "rsuite"
import { notifySuccess } from "../../lib/notify"

export default class ApprovedBtn extends Component {
  constructor(props) {
    super(props)
    this.state = {
      approval: 0,
    }
  }

  handleApproveRequest = () => {
    const approvalHash = this.props.data.approval_hash
    const host = window.location.host
    const protocol = window.location.protocol
    const url = `${protocol}//${host}/api/mail/response?h=${approvalHash}&a=a&b=0${
      this.props.data.type === "homeoffice" ? "&ho=true" : ""
    }`
    fetch(url)
      .then((data) => {
        if (data.status === 200) {
          this.setState({
            approval: 2,
          })
          notifySuccess("Request Approved")
        }
      })
      .catch((err) => console.error(err))
  }

  handleDenyRequest = () => {
    const approvalHash = this.props.data.approval_hash
    const host = window.location.host
    const protocol = window.location.protocol
    const url = `${protocol}//${host}/api/mail/response?h=${approvalHash}&a=d&b=0${
      this.props.data.type === "homeoffice" ? "&ho=true" : ""
    }`
    fetch(url)
      .then((data) => {
        if (data.status === 200) {
          this.setState({
            approval: 1,
          })
          notifySuccess("Request Denied")
        }
      })
      .catch((err) => console.error(err))
  }

  render() {
    const { approval } = this.state

    if (this.props.data.type === "sick") {
      return (
        <span>
          <Tag color="green">N/A</Tag>
        </span>
      )
    }

    if (this.props.value === 2 || approval === 2) {
      return (
        <span>
          <Tag color="green">Approved</Tag>
        </span>
      )
    } else if (this.props.value === 1 || approval === 1) {
      return (
        <span>
          <Tag color="red">Denied</Tag>
        </span>
      )
    } else {
      return (
        <ButtonToolbar>
          <ButtonGroup>
            <Button
              onClick={this.handleApproveRequest}
              className="approve-btns approve"
              style={{ height: "24px" }}
              size="sm"
              appearance="primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                width="1em"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </Button>
            <Button
              onClick={this.handleDenyRequest}
              className="approve-btns deny"
              style={{
                height: "24px",
                color: "#f78282",
                borderColor: "#f78282",
                paddingTop: "3px",
              }}
              size="sm"
              appearance="ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                width="0.8em"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={4}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </ButtonGroup>
          <style jsx>
            {`
              :global(.approve-btns) {
                line-height: 1;
                transition: box-shadow 250ms ease-in-out;
              }
              :global(.approve-btns.deny:hover) {
                box-shadow: 0 2px 0 rgba(247, 130, 130, 0.11),
                  0 4px 8px rgba(247, 130, 130, 0.12),
                  0 10px 10px rgba(247, 130, 130, 0.06),
                  0 7px 70px rgba(247, 130, 130, 0.1);
              }
              :global(.approve-btns.approve:hover) {
                box-shadow: 0 2px 0 rgba(85, 173, 50, 0.11),
                  0 4px 8px rgba(85, 173, 50, 0.12),
                  0 10px 10px rgba(85, 173, 50, 0.06),
                  0 7px 70px rgba(85, 173, 50, 0.1);
              }
            `}
          </style>
        </ButtonToolbar>
      )
    }
  }
}
