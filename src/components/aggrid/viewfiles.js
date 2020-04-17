import React from 'react'
import {
  Icon,
  IconButton
} from 'rsuite'

export default class ViewFiles extends React.Component {
  render () {
    if (this.props.data.files) {
      const files = JSON.parse(this.props.data.files)
      if (files.length > 0) {
        return (
          <span onClick={() => this.props.viewFiles(JSON.parse(this.props.data.files))} className='file-icon'>
            <IconButton size='sm' icon={<Icon icon='download' />} appearance='ghost'>
              Files
            </IconButton>
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
