import React from 'react'
import DropzoneComponent from 'react-dropzone-component'
import {Button} from 'mdbreact'
require('../styles/filepiscker.css')
require('../../node_modules/dropzone/dist/min/dropzone.min.css')

export default class DropZone extends React.Component {
  constructor (props) {
    super(props)

    // For a full list of possible configurations,
    // please consult http://www.dropzonejs.com/#configuration
    this.djsConfig = {
      addRemoveLinks: true,
      acceptedFiles: 'image/jpeg,image/png,image/gif',
      autoProcessQueue: false,
      maxFiles: this.props.max,
      parallelUploads: 1,
      params: {
        login: localStorage.getItem('login')
      }
    }

    this.componentConfig = {
      iconFiletypes: ['.jpg', '.png', '.gif'],
      showFiletypeIcon: true,
      postUrl: 'upload/prof/'
    }

    this.dropzone = null
    this.handleFileAdded = this.handleFileAdded.bind(this)
  }

  handleFileAdded (file) {
  }

  handlePost () {
    this.dropzone.processQueue()
  }

  handleComplete = (e) => {
    if (this.dropzone.getQueuedFiles().length !== 0)
      this.dropzone.processQueue()
    else {
      this.props.init()
      this.props.setNotif('Image(s) added to your profile !', 'success')
    }
  }

  render () {
    const config = this.componentConfig
    const djsConfig = this.djsConfig

    // For a list of all possible events (there are many), see README.md!
    const eventHandlers = {
      init: dz => this.dropzone = dz,
      addedfile: this.handleFileAdded.bind(this),
      success: this.handleComplete.bind(this)
    }

    return (
      <div>
        <DropzoneComponent disabled config={config} eventHandlers={eventHandlers} djsConfig={djsConfig} />
        <center><Button onClick={this.handlePost.bind(this)}>Upload</Button></center>
      </div>
    )
  }
}

// https://github.com/felixrieseberg/React-Dropzone-Component
