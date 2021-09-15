import React, { Component } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons"

export default class Dropzone extends Component {
  constructor(props) {
    super(props)
    this.state = { hightlight: false }
    this.fileInputRef = React.createRef()
  }

  openFileDialog = () => {
    if (this.props.disabled) return
    this.fileInputRef.current.click()
  }

  fileListToArray = (list) => {
    const array = []
    for (var i = 0; i < list.length; i++) {
      array.push(list.item(i))
    }
    return array
  }

  onDragOver = (e) => {
    e.preventDefault()
    if (this.props.disabled) return
    this.setState({ hightlight: true })
  }

  onDragLeave = () => {
    this.setState({ hightlight: false })
  }

  onDrop = (e) => {
    e.preventDefault()

    if (this.props.disabled) return

    const files = e.dataTransfer.files
    if (this.props.onFilesAdded) {
      const array = this.fileListToArray(files)
      this.props.onFilesAdded(array)
    }
    this.setState({ hightlight: false })
  }

  onFilesAdded = (e) => {
    if (this.props.disabled) return
    const files = e.target.files
    if (this.props.onFilesAdded) {
      const array = this.fileListToArray(files)
      this.props.onFilesAdded(array)
    }
  }

  render() {
    return (
      <div
        className={`Dropzone ${this.state.hightlight ? "Highlight" : ""}`}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        onClick={this.openFileDialog}
        style={{ cursor: this.props.disabled ? "default" : "pointer" }}
      >
        <FontAwesomeIcon
          icon={faCloudUploadAlt}
          width="4em"
          style={{ color: "#67B246" }}
        />
        <input
          ref={this.fileInputRef}
          className="FileInput"
          type="file"
          multiple
          onChange={this.onFilesAdded}
        />
        <span>Upload Files</span>
        <style jsx>
          {`
            .Dropzone {
              height: 140px;
              width: 140px;
              background-color: #fff;
              border: 3px dashed #67b246;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              font-size: 14px;
              margin: 0 auto;
            }
            .Highlight {
              background-color: rgb(188, 185, 236);
            }
            .FileInput {
              display: none;
            }
            .Icon {
              opacity: 0.3;
              height: 64px;
              width: 64px;
            }
          `}
        </style>
      </div>
    )
  }
}
