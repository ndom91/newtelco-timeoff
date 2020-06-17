import React from 'react'
import aws from 'aws-sdk'
import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import FilePondPluginFilePoster from 'filepond-plugin-file-poster'
import 'filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css'
import FilePondPluginImageCrop from 'filepond-plugin-image-crop'

registerPlugin(FilePondPluginImagePreview, FilePondPluginFilePoster, FilePondPluginImageCrop)

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('fra1.digitaloceanspaces.com')
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACE_KEY,
  secretAccessKey: process.env.DO_SPACE_SECRET
})

export default class Upload extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      files: []
    }
    this.handleFileUploadSuccess = props.handleFileUploadSuccess
  }

  handleInit() {
    // console.log('FilePond instance has initialised', this.pond)
  }

  render() {
    return (
      <div className='App'>
        <FilePond
          ref={ref => (this.pond = ref)}
          files={this.state.files}
          allowMultiple
          allowFilePoster
          allowImageCrop
          allowRevert={false}
          oninit={() => this.handleInit()}
          onupdatefiles={fileItems => {
            // Set currently active file objects to this.state
            this.setState({
              files: fileItems.map(fileItem => fileItem.file)
            })
          }}
          server={{
            // fake server to simulate loading a 'local' server file and processing a file
            process: (fieldName, file, metadata, load) => {
              const key = `${Date.now()}_${file.name}`
              var params = {
                Bucket: 'nt-timeoff',
                Key: key,
                Body: file,
                ACL: 'public-read'
              }
              s3.putObject(params, (err, data) => {
                if (err) console.error(err, err.stack)
                else {
                  this.props.handleFileUploadSuccess(key, file.name, `https://nt-timeoff.fra1.digitaloceanspaces.com/${key}`)
                  load(`https://nt-timeoff.fra1.digitaloceanspaces.com/${key}`)
                }
              })
            }
          }}
        />
      </div>
    )
  }
}
