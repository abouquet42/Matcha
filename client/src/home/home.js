import React from 'react'
import axios from 'axios'
import Gallery from 'react-photo-gallery'
import CarouselPage from './carousel'
import './home.css'

class HomePage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      login: null,
      photos: null
    }
    this.socket = this.props.socket
    this.socket.on('imOnline', (data) => {
      if (data === localStorage.login) {
        this.setState({
          login: data
        })
      }
    })
  }

  componentWillMount = () => {
    let body = document.querySelector('body')
    body.style = "touch-action: none !important"
    window.addEventListener('mousemove', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
    let login = localStorage.login
    this.setState({
      login: login
    })
    if (!login) {
      document.querySelector('body').className = 'noScroll'
      axios.post('/gen/pictures', {data: 'home'})
        .then((result) => {
          let all = []
          let res = result.data
          if (result.status === 200) {
            for (let i = 0; i < res.length; i++) {
              all[i] = {src: res[i], key: i, width: 1, height: 1}
              if (i === res.length - 1) {
                this.setState({
                  photos: all
                })
              }
            }
          }
        })
    }
  }
  
  render () {
    const {login, photos} = this.state
    return (
      <div style={{height: '100%', width: '100%'}}>
        {login ?
          <CarouselPage socket={this.props.socket}/>
          : <div>
            {photos ? <Gallery style={{ justifyContent: 'space-arround' }} photos={photos} direction={'column'} columns={12} /> : '' }
            </div>
        }
      </div>
    )
  }
}

export default HomePage
