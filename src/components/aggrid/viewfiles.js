import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileAlt
} from '@fortawesome/free-regular-svg-icons'

export default class ViewFiles extends React.Component {
  render () {
    if (this.props.data.files) {
      const files = JSON.parse(this.props.data.files)
      if (files.length > 0) {
        return (
          <span onClick={() => this.props.viewFiles(files)} className='file-icon'>
            <FontAwesomeIcon icon={faFileAlt} width='1.2rem' />
            <style jsx>{`
              .file-icon:hover {
                cursor: pointer;
              }
            `}
            </style>
          </span>
        )
      } else {
        return <span>N/A</span>
      }
    } else {
      return <span>N/A</span>
    }
  }
};
