import React from 'react'
import Dropzone from './dropzone'
import fetch from 'isomorphic-unfetch'
import { Progress } from 'rsuite'
const { Line } = Progress

export default class UploadFile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      files: [],
      uploading: false,
      uploadProgress: {},
      successfullUploaded: false
    }

    this.onFilesAdded = this.onFilesAdded.bind(this)
    this.uploadFiles = this.uploadFiles.bind(this)
    this.sendRequest = this.sendRequest.bind(this)
    this.renderActions = this.renderActions.bind(this)
  }

  renderProgress (file) {
    const uploadProgress = this.state.uploadProgress[file.name]
    if (this.state.uploading || this.state.successfullUploaded) {
      return (
        <div className='ProgressWrapper'>
          <Line percent={uploadProgress ? uploadProgress.percentage : 0} />
        </div>
      )
    }
  }

  async uploadFiles () {
    this.setState({ uploadProgress: {}, uploading: true })
    const promises = []
    this.state.files.forEach(file => {
      promises.push(this.sendRequest(file))
    })
    try {
      await Promise.all(promises)
      this.setState({ successfullUploaded: true, uploading: false })
    } catch (e) {
      this.setState({ successfullUploaded: true, uploading: false })
    }
  }

  sendRequest = (file) => {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest()

      req.upload.addEventListener('progress', event => {
        if (event.lengthComputable) {
          const copy = { ...this.state.uploadProgress }
          copy[file.name] = {
            state: 'pending',
            percentage: (event.loaded / event.total) * 100
          }
          this.setState({ uploadProgress: copy })
        }
      })

      req.upload.addEventListener('load', event => {
        const copy = { ...this.state.uploadProgress }
        copy[file.name] = { state: 'done', percentage: 100 }
        this.setState({ uploadProgress: copy })
        resolve(req.response)
      })

      req.upload.addEventListener('error', event => {
        const copy = { ...this.state.uploadProgress }
        copy[file.name] = { state: 'error', percentage: 0 }
        this.setState({ uploadProgress: copy })
        reject(req.response)
      })

      req.onreadystatechange = (e) => {
        if (req.readyState === 4 && req.status === 200) {
        // File uploaded successfully
          var response = JSON.parse(req.responseText)
          console.log(response)
          this.props.handleFileUploadSuccess(response)
        }
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)
      formData.append('tags', 'vacation')
      formData.append('tags', this.props.email)
      // formData.append('description', 'File Description')
      formData.append('upload_preset', 'kvulbpzi')

      req.open('POST', process.env.CLOUDINARY_UPLOAD)
      req.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
      req.send(formData)
    })
  }

  onFilesAdded = (files) => {
    this.setState(prevState => ({
      files: prevState.files.concat(files)
    }), () => {
      this.uploadFiles()
    })
  }

  renderActions = () => {
    if (this.state.successfullUploaded) {
      return (
        <button
          onClick={() => this.setState({ files: [], successfullUploaded: false })}
        >
          Clear
        </button>
      )
    } else {
      return (
        <button
          disabled={this.state.files.length < 0 || this.state.uploading}
          onClick={this.uploadFiles}
        >
          Upload
        </button>
      )
    }
  }

  render () {
    return (
      <div className='Upload'>
        <div className='Content'>
          <div>
            <Dropzone
              onFilesAdded={this.onFilesAdded}
              disabled={this.state.uploading || this.state.successfullUploaded}
            />
          </div>
          <div className='Files'>
            {this.state.files.map(file => {
              return (
                <div key={file.name} className='Row'>
                  <span className='Filename'>{file.name}</span>
                  {this.renderProgress(file)}
                </div>
              )
            })}
          </div>
        </div>
        {/* <div className='Actions'>{this.renderActions()}</div> */}
        <style jsx>{`
          .Upload {
            display: flex;
            width: 100%;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            align-items: flex-start;
            text-align: left;
            overflow: hidden;
          }
          .Content {
            display: flex;
            flex-direction: column;
            padding-top: 16px;
            box-sizing: border-box;
            width: 100%;
          }
          .Files {
            align-items: flex-start;
            justify-items: center;
            flex: 1;
            overflow-y: visible;
          }
          .Actions {
            display: flex;
            flex: 1;
            width: 100%;
            align-items: flex-end;
            flex-direction: column;
            margin-top: 32px;
          }
          .CheckIcon {
            opacity: 0.5;
            margin-left: 32px;
          }
          .ProgressWrapper {
            display: flex;
            flex: 1;
            flex-direction: row;
            align-items: center;
          }
          button {
            font-family: 'Roboto medium', sans-serif;
            font-size: 14px;
            display: inline-block;
            height: 36px;
            min-width: 88px;
            padding: 6px 16px;
            line-height: 1.42857143;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            -ms-touch-action: manipulation;
            touch-action: manipulation;
            cursor: pointer;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            border: 0;
            border-radius: 2px;
            background: rgba(103, 58, 183, 1);
            color: #fff;
            outline: 0;
          }
          button:disabled {
            background: rgb(189, 189, 189);
            cursor: default;
          } 
          .Filename {
            margin-bottom: 8px;
            font-size: 16px;
            color: #555;
          }
          .Row {
            display: flex;
            flex: 1;
            flex-direction: column;
            justify-content: space-between;
            height: 80px;
            padding: 8px;
            overflow: visible;
            box-sizing: border-box;
          }
        `}
        </style>
      </div>
    )
  }
}
