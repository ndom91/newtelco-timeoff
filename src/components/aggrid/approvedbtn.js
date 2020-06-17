import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { Button, ButtonGroup, ButtonToolbar, Tag, Notification } from 'rsuite'

export default class ApprovedBtn extends Component {
  constructor(props) {
    super(props)
    this.state = {
      approval: 0,
    }
  }

  notifyError = (header, text) => {
    Notification.error({
      title: header,
      duration: 3000,
      description: <div className='notify-body'>{text}</div>,
    })
  }

  notifySuccess = (header, text) => {
    Notification.success({
      title: header,
      duration: 3000,
      description: <div className='notify-body'>{text}</div>,
    })
  }

  handleApproveRequest = data => {
    const approvalHash = this.props.data.approval_hash
    const host = window.location.host
    const protocol = window.location.protocol
    const url = `${protocol}//${host}/api/mail/response?h=${approvalHash}&a=a&b=0`
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          this.setState({
            approval: 2,
          })
          this.notifySuccess('Request Approved')
        }
      })
      .catch(err => console.error(err))
  }

  handleDenyRequest = () => {
    const approvalHash = this.props.data.approval_hash
    const host = window.location.host
    const protocol = window.location.protocol
    const url = `${protocol}//${host}/api/mail/response?h=${approvalHash}&a=d&b=0`
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          this.setState({
            approval: 1,
          })
          this.notifySuccess('Request Denied')
        }
      })
      .catch(err => console.error(err))
  }

  render() {
    const { approval } = this.state

    if (this.props.data.type === 'sick') {
      return (
        <span>
          <Tag color='green'>N/A</Tag>
        </span>
      )
    }

    if (this.props.value === 2 || approval === 2) {
      return (
        <span>
          <Tag color='green'>Approved</Tag>
        </span>
      )
    } else if (this.props.value === 1 || approval === 1) {
      return (
        <span>
          <Tag color='red'>Denied</Tag>
        </span>
      )
    } else {
      return (
        <ButtonToolbar>
          <ButtonGroup>
            <Button
              onClick={this.handleApproveRequest}
              className='approve-btns approve'
              style={{ height: '24px' }}
              size='sm'
              appearance='primary'
            >
              <FontAwesomeIcon width='1em' icon={faCheck} />
            </Button>
            <Button
              onClick={this.handleDenyRequest}
              className='approve-btns deny'
              style={{
                height: '24px',
                color: '#f78282',
                borderColor: '#f78282',
                paddingTop: '3px',
              }}
              size='sm'
              appearance='ghost'
            >
              <FontAwesomeIcon width='0.8em' icon={faTimes} />
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
