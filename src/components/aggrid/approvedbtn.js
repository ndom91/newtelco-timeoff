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
              <Button className='approve-btns' style={{ height: '30px', color: '#f78282', borderColor: '#f78282' }} size='sm' appearance='ghost'>
                <FontAwesomeIcon width='1em' icon={faTimes} />
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
          <style jsx>{`
              :global(.approve-btns) {
                line-height: 1;
                transition: box-shadow 250ms ease-in-out;
              }
              :global(.approve-btns:hover) {
                box-shadow: 0 2px 0 rgba(90,97,105,.11), 0 4px 8px rgba(90,97,105,.12), 0 10px 10px rgba(90,97,105,.06), 0 7px 70px rgba(90,97,105,.1);
              }
          `}
          </style>
        </span>
      )
    }
  }
};
