import React from 'react'
import FacebookLogin from 'react-facebook-login'
import axios from 'axios'

class FbLog extends React.Component {
  constructor(props) {
    super(props)
    this.socket = this.props.socket
    this.responseFacebook = this.responseFacebook.bind(this)
  }
  
  responseFacebook = (response) => {
    if (response.status || response.email) {
      axios.post('/user/connect/facebook', {data: response})
      .then((result) => {
        if (result.data && result.data !== false) {
          localStorage.setItem('login', result.data.login)
          localStorage.setItem('id', result.data.id)
          this.socket.emit('setState/online', result.data.login)
          this.props.toggle()
        }
      })
    }
  }
  render () {
    return (
      <FacebookLogin
        appId="308199079944568"
        autoLoad={false}
        size='small'
        textButton='Login'
        fields="name,email,picture"
        callback={this.responseFacebook}
        icon="fa-facebook"
      />
    )
  }
}
export default FbLog
