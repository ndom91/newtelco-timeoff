import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons'
import {
  Panel,
  Button
} from 'rsuite'

const File = (props) => {
  return (
    <>
      <Panel className='file-wrapper' bordered>
        <span>
          {props.file.name}
        </span>
        <span>
          <Button onClick={() => props.onDelete(props.file.name)} appearance='default'>
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
        </span>
      </Panel>
      <style jsx>{`
        :global(.file-wrapper) {
          margin: 10px;
          border: 1px dashed #e5e5ea !important;
        }
        :global(.file-wrapper > div) {
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;
        }
      `}
      </style>
    </>
  )
}

export default File
