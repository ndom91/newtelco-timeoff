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
              <Button size='sm' appearance='primary'>
                <FontAwesomeIcon width='1.2em' icon={faCheck} />
              </Button>
              <Button style={{ height: '32px' }} size='sm' apperaance='subtle'>
                <FontAwesomeIcon width='1em' icon={faTimes} />
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
        </span>
      )
    }
  }
};
