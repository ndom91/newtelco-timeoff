import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import {
  Button,
  ButtonGroup,
  ButtonToolbar
} from 'rsuite'

export default class ApprovedBtn extends Component {
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
          <ButtonToolbar>
            <ButtonGroup>
              <Button className='approve-btns' style={{ height: '30px' }} size='sm' appearance='primary'>
                <FontAwesomeIcon width='1.2em' icon={faCheck} />
              </Button>
              <Button className='approve-btns' style={{ height: '30px', color: '#f56161' }} size='sm' appearance='ghost'>
                <FontAwesomeIcon width='1em' icon={faTimes} />
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
          <style jsx>{`
              :global(.approve-btns) {
                line-height: 1;
              }
          `}
          </style>
        </span>
      )
    }
  }
};
