import React from 'react'
import { format, isValid } from 'date-fns'
import {
  Avatar,
  Tag,
  Panel,
  Button
} from 'rsuite'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons'

const Comment = (props) => {
  let initials = ''
  if (props.data.userDetails) {
    initials = props.data.userDetails.fname.substr(0, 1) + props.data.userDetails.lname.substr(0, 1)
  }
  return (
    <Panel className='comment-panel' bordered>
      <div className='comment-header'>
        <Avatar circle>{initials}</Avatar>
        {props.data.userDetails
          ? (
            <h4 className='comment-user-name'>
              {props.data.userDetails.fname} {props.data.userDetails.lname}
            </h4>
          ) : (
            null
          )}
        {props.data.datetime
          ? <Tag color='green' className='comment-user-datetag'>{isValid(new Date(props.data.datetime)) && format(new Date(props.data.datetime), 'dd.MM.yyyy HH:mm:ss')}</Tag>
          : ''}
      </div>
      <div className='comment-body'>
        {props.data.body}
      </div>
      <div className='comment-actions'>
        <Button onClick={() => props.onDelete(props.data.id)} className='comment-del-btn'>
          <FontAwesomeIcon icon={faTrashAlt} />
        </Button>
      </div>
      <style jsx>{`
        :global(.comment-panel) {
          position: relative;
          width: 100%;
          margin-bottom: 10px;
        }
        :global(.comment-del-btn) {
          position: absolute;
          right: 10px;
          bottom: 10px;
        }
        :global(.comment-header) {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 5px;
        }
        :global(.comment-user-datetag) {
          margin-left: auto;
          background-color: #67b246;
        }
        :global(.comment-user-name) {
          margin-left: 5px;
        }
        :global(.comment-body) {
          padding: 15px;
        }
      `}
      </style>
    </Panel>
  )
}

export default Comment
