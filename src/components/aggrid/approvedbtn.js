import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Tag
} from 'rsuite'

export default class ApprovedBtn extends Component {
  render () {
    if (this.props.value === 2) {
      return (
        <span>
          <Tag color='green'>Approved</Tag>
        </span>
      )
    } else if (this.props.value === 1) {
      return (
        <span>
          <Tag color='red'>Denied</Tag>
        </span>
      )
    } else {
      return (
        <ButtonToolbar>
          <ButtonGroup>
            <Button className='approve-btns approve' style={{ height: '24px' }} size='sm' appearance='primary'>
              <FontAwesomeIcon width='1em' icon={faCheck} />
            </Button>
            <Button className='approve-btns deny' style={{ height: '24px', color: '#f78282', borderColor: '#f78282', paddingTop: '3px' }} size='sm' appearance='ghost'>
              <FontAwesomeIcon width='0.8em' icon={faTimes} />
            </Button>
          </ButtonGroup>
          <style jsx>{`
            :global(.approve-btns) {
              line-height: 1;
              transition: box-shadow 250ms ease-in-out;
            }
            :global(.approve-btns.deny:hover) {
              box-shadow: 0 2px 0 rgba(247, 130, 130,.11), 0 4px 8px rgba(247, 130, 130,.12), 0 10px 10px rgba(247, 130, 130,.06), 0 7px 70px rgba(247, 130, 130,.1);
            }
            :global(.approve-btns.approve:hover) {
              box-shadow: 0 2px 0 rgba(85, 173, 50,.11), 0 4px 8px rgba(85, 173, 50,.12), 0 10px 10px rgba(85, 173, 50,.06), 0 7px 70px rgba(85, 173, 50,.1);
            }
          `}
          </style>
        </ButtonToolbar>
      )
    }
  }
};
