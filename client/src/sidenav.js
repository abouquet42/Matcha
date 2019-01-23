import React from 'react'
// eslint-disable-next-line
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav'
import '@trendmicro/react-sidenav/dist/react-sidenav.css'
// eslint-disable-next-line
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import io from 'socket.io-client'
import GoogleLogin from 'react-google-login'
import axios from 'axios'
import FbLog from './fblogin'
import { Container, Row, Col, Input, Button, Fa, Modal, ModalBody, ModalFooter } from 'mdbreact'
let colStyle = {
  flexBasis: 'auto',
  maxWidth: '100%'
}
let contStyle = {
  width: 'auto'
}
class SideNavPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      offHover: false,
      login: null,
      socialId: null,
      modal: false,
      loginInput: '',
			pwd: '',
      open: false,
      infosOK: ''
    }
    this.HoverToogle = this.HoverToogle.bind(this)
    this.toggle = this.toggle.bind(this)
    this.socket = io('https://localhost:3000', {
      trasnports: [ 'polling' ]
    })
    this.socket.on('imOnline', (data) => {
      let login = localStorage.getItem('login')
      if (login === data) {
      axios.post('/GetSocialState', {login})
        .then((result) => {
          this.setState({
            socialId: result.data
          })
        })
      // if (login === data) {
        this.setState({
          login: data
        })
      }
    })
  }

  componentWillMount = () => {
    let login = localStorage.getItem('login')
    this.setState({
      login: login
    })
  }

  openLogin = (e) => {
    e.preventDefault()
  }

  HoverToogle () {
    this.setState({
      offHover: !this.state.offHover
    })
  }
  logOut = (e) => {
    e.preventDefault();
    let login = localStorage.login
    localStorage.removeItem('login')
    this.socket.emit('/jepars', login)
    window.location = "/"
    }

    onChange = (e) => {
      e.preventDefault()
      this.setState({[e.target.name]: e.target.value})
    }
    onSubmit = (e) => {
      e.preventDefault();
      const {loginInput, pwd} = this.state
      const login = loginInput
      axios.post('/user/connect', {login, pwd})
        .then((result) => {
        let etat = result.data
        if (result.data && result.data !== 'Pb' && result.data !== 'Reported') {
          localStorage.setItem('login', result.data.login)
          localStorage.setItem('id', result.data.id)
          this.socket.emit('setState/online', result.data.login)
          this.toggle()
        } else {
          this.setState({ infosOK: etat })
        }
      })
    }
    toggle = (e) => {
      this.setState({
        modal: !this.state.modal
      })
    }
    handleKeyPress = (event) => {
      if(event.key === 'Enter'){
        document.getElementById('login').click()
      }
    }
    responseGoogle = (response) => {
      axios.post('/user/connect/google', {data: response})
        .then((result) => {
          if (result.data && result.data !== false) {
            localStorage.setItem('login', result.data.login)
            localStorage.setItem('id', result.data.id)
            this.socket.emit('setState/online', result.data.login)
            this.toggle()
          }
        })
    }
  render () {
    const {offHover, login, socialId} = this.state
    let infosOK = this.state.infosOK
    return (
      <div>
      {!login ?
      <Container className='containerHeader' style={contStyle}>
        <Row>
          <Col md="6" style={colStyle}>
            <Modal isOpen={this.state.modal} toggle={this.toggle} className="cascading-modal">
              <div className="modal-header primary-color white-text">
                <h4 className="title">
                  <Fa className="fa fa-pencil" /> Log in</h4>
                <button type="button" className="close" onClick={this.toggle}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <ModalBody className="grey-text">
                <Input name='loginInput' size="sm" label="Your login" icon="user" group type="text" validate error="wrong" success="right" onChange={this.onChange} onKeyPress={this.handleKeyPress}/>
                <Input name='pwd' size="sm" label="Your password" icon="lock" group type="password" validate error="wrong" success="right" onChange={this.onChange} onKeyPress={this.handleKeyPress}/>
                {infosOK === 'Pb' ? <p style={{ color: 'red', fontSize: '14px' }}><b>Login or password are not good!</b></p> : 
                infosOK === 'Reported' ? <p style={{ color: 'red', fontSize: '14px' }}><b>You've been reported by too many users, you can't connect anymore!</b></p> : ''}
                <span>Forgot password? <a href='/forgot'>click here</a></span>
                <br />
                <div className='hr'>Or log in with Google or Facebook</div>
                  <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                    <GoogleLogin
                      clientId="479600398331-phq9a6helprl92ho87tl6ff5hi89ffii.apps.googleusercontent.com"
                      buttonText='Log in with Google'
                      onSuccess={this.responseGoogle}
                      onFailure={this.responseGoogle}
                      className='g-signin2'
                    />
                    <FbLog toggle={this.toggle} socket={this.socket}/>
                  </div>
              </ModalBody>
              <ModalFooter>
                <Button id='login' color="primary" onClick={this.onSubmit}>Log in</Button>
              </ModalFooter>
            </Modal>
          </Col>
        </Row>
      </Container> : '' }
      <Route render={({ location, history }) => (
        <React.Fragment>
          <SideNav className='sc-bwzfXH KssWCo' style={{position: 'fixed'}} onSelect={(selected) => {
            const to = '/' + selected
            if (location.pathname !== to && selected !== 'login') {
              history.push(to)
              window.location = to
            }
          }
          }>
            <SideNav.Toggle />
            <SideNav.Nav defaultSelected={location.pathname.replace('/', '') + location.search}>
              <NavItem eventKey='home'>
                <NavIcon>
                  <i className='fa fa-fw fa-home' style={{ fontSize: '1.75em' }} />
                </NavIcon>
                <NavText>
                    Home
                </NavText>
              </NavItem>
              {login ?
                <NavItem eventKey='User'>
                  <NavIcon>
                    <i className='fa fa-fw fa-user' style={{ fontSize: '1.75em' }} />
                  </NavIcon>
                  <NavText>
                      {login}
                  </NavText>
                  <NavItem eventKey='profil'>
                    <NavText>
                          Profil
                    </NavText>
                  </NavItem>
                  <NavItem eventKey='profil?match'>
                    <NavText>
                          Match
                    </NavText>
                  </NavItem>
                  <NavItem eventKey='profil?pic'>
                    <NavText>
                          Pictures
                    </NavText>
                  </NavItem>
                  <NavItem eventKey='profil?all'>
                    <NavText>
                          All info
                    </NavText>
                  </NavItem>
                  {socialId === null || socialId.length === 0 ?
                  <NavItem eventKey='profil?pass'>
                    <NavText>
                          Password
                    </NavText>
                  </NavItem>
                  : '' }
                  <NavItem eventKey='profil?visit'>
                    <NavText>
                          Visits / Likes
                    </NavText>
                  </NavItem>
                </NavItem>
              : ''}
              {login ?
              <NavItem eventKey='Search'>
                <NavIcon>
                  <i className='fas fa-fw fa-search' style={{ fontSize: '1.75em' }} />
                </NavIcon>
                <NavText>
                    Search
                </NavText>
              </NavItem>
              :
              <NavItem eventKey='login' onClick={this.toggle}>
                <NavIcon>
                  <i className='far fa-user-circle' style={{ fontSize: '1.75em' }} />
                </NavIcon>
                <NavText>
                    Log in
                </NavText>
              </NavItem>
              }
              {login ?
              <NavItem className='logOutNav' eventKey='' onClick={this.logOut} onMouseEnter={this.HoverToogle} onMouseLeave={this.HoverToogle}>
                <NavIcon>
                  <Fa icon="power-off" className={offHover ?  'turn mr-1 fa-2x' : 'mr-1 fa-2x'}/>
                  {/* <i className='fa fa-fw fa-home' style={{ fontSize: '1.75em' }} /> */}
                </NavIcon>
                <NavText>
                      Log out
                </NavText>
              </NavItem>
              :
              <NavItem eventKey='signup'>
                <NavIcon>
                  <i className='fas fa-user-plus' style={{ fontSize: '1.5em', marginLeft: '0.6rem' }} />
                </NavIcon>
                <NavText>
                    Sign up
                </NavText>
              </NavItem>
            }
            </SideNav.Nav>
          </SideNav>
        </React.Fragment>
      )}
      />
      </div>
    )
  }
}

export default SideNavPage
