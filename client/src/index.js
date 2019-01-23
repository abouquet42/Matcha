/* eslint react/prop-types: 0 */
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import './style.css'
import Header from './Header'
import SuPage from './signup/signup'
import ActivationPage from './activation/activation'
import searchPage from './search/search'
// import LocationSearchInput from './Location/location'
// import DropZone from './testing/dropzone'

import ProfilPage from './profil/profil'
import HomePage from './home/home'
import {Forgot, ChangePassword} from './forgot/forgot'
import SideNavPage from './sidenav.js'
// import SiPage from './signin/signin'
import registerServiceWorker from './registerServiceWorker'
// import axios from 'axios'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'
import 'semantic-ui-css/semantic.min.css'
import 'react-circular-progressbar/dist/styles.css'
import DropUpContact from './chat/contacts'
// eslint-disable-next-line
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"
import UserProfil from './user/user'
import FbLog from './fblogin'
import io from 'socket.io-client'
import axios from 'axios'

const socket = io('https://localhost:3000', {
  trasnports: [ 'polling' ]
})

class Root extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      canMount: false
    }
  }

  componentWillMount = () => {
    let login = localStorage.login
    if (login) {
      axios.post('/Check/UserConnect', {login})
      .then((result) => {
        if (result.data !== true) {
          localStorage.removeItem('login')
          localStorage.removeItem('id')
          window.location = '/'
          this.setState({
            canMount: false
          })
        } else {
          this.setState({
            canMount: true
          })
        }
      })
    } else {
      this.setState({
        canMount: true
      })
    }
  }
  
  render () {
    const {canMount} = this.state
    if (canMount === true) {
      return (
        <Switch>
          <Route exact path='/signup' component={SuPage} />
          <Route exact path='/activation/:token' component={ActivationPage} />
          <Route exact path='/search' component={searchPage} />
          <Route exact path='/forgot/:token' component={ChangePassword} />
          <Route exact path='/forgot' component={Forgot} />
          <Route exact path='/profil' component={props => <ProfilPage socket={socket} location={props.location} />} />
          <Route exact path='/user' component={props => <UserProfil socket={socket} location={props.location} />} />
          <Route exact path='/' component={props => <HomePage socket={socket} />} />
          <Route exact path='/fb' component={FbLog} />
          <Route component={props => <HomePage socket={socket} />} />
        </Switch>
      )
    } else {
      return ( <div /> )
    }
  }
}

ReactDOM.render(
  <div>
    <Header socket={socket} />
    <div className='mainPage'>
      <Router>
        <SideNavPage />
      </Router>
      <Router>
        <Root />
      </Router>
    </div>
    <DropUpContact />
  </div>,
  document.getElementById('root')
)
registerServiceWorker()
