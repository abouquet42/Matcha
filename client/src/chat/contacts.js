import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import './chat.css'
import io from 'socket.io-client'
import ChatWindow from './chat'
import Badge from '@material-ui/core/Badge'
import axios from 'axios'

const styles = theme => ({
  badge: {
    top: 0,
    right: 37,
    // The border color match the background color.
    border: `2px solid ${
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[900]
    }`,
  },
  badge2: {
    top: -19,
    left: -181,
    // The border color match the background color.
    border: `2px solid ${
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[900]
    }`,
  },
  button: {
    // margin: theme.spacing.unit
    width: '300px',
    backgroundColor: 'white',
  },
  input: {
    display: 'none'
  },
  contact: {
    width: '280px',
    display: 'flex',
    justifyContent: 'space-between',
    cursor: 'pointer'
  }
})

function OutlinedButtons (props) {
  
  const { classes, toggleDU, show, contacts, toggleWindow } = props
  let conts = null
  let all = 0;
  let allBadge = 0
  let online = 0
  if (contacts) {
    conts = Object.keys(contacts).map((contact, index) =>
      <div className='contactDU' key={index} onClick={toggleWindow} id={contacts[contact]['room']} login={contact}>
          <span id={contacts[contact]['room']} login={contact}>{contact}</span>
        {contacts[contact]['badge'] && contacts[contact]['badge'] > 0 ? 
        <Badge id={'badge' + contacts[contact]['room']} onClick={e => toggleWindow(e, contacts[contact]['room'])} badgeContent={contacts[contact]['badge']} color="error" classes={{ badge: classes.badge }}>
          <div />
        </Badge>
        : '' }
        <span id={contacts[contact]['room']} login={contact} style={contacts[contact]['state'] ? {color: 'green'} : {color: 'red'}}>{contacts[contact]['state'] ? 'online' : 'offline'}</span>
      </div>
    )
    Object.keys(contacts).map((contact, index) => {
      if (contacts[contact]['badge'] > 0)
        allBadge += contacts[contact]['badge']
      all++
      if (contacts[contact]['state'])
        online++
      return null
    })

  }
  return (
    <div>
      <Button onClick={toggleDU} variant="outlined" color="primary" className={classes.button + ' buttonDropUp'}>
        <div className={classes.contact}>
          <span>Contacts</span>
          {allBadge > 0 ?
          <Badge badgeContent={allBadge} color="error" classes={{ badge: classes.badge2 }}>
            <div />
          </Badge>
          : '' }
          <span>{online} / {all}</span>
        </div>
      </Button>
      <div className={show ? 'DropUpContent showDropUp' : 'DropUpContent hideDropUp'}>
        <span>{conts}</span>
      </div>
    </div>
  )
}

OutlinedButtons.propTypes = {
  classes: PropTypes.object.isRequired
}

let ContactButton = withStyles(styles)(OutlinedButtons)

class DropUpContact extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      on: false,
      show: false,
      contacts: null,
      chatWindow: {},
      click: false,
      valid: true,
      login: localStorage.getItem('login'),
      badge: {}
    }
    this.toogleWindow = this.toogleWindow.bind(this)
    this.dropDu = this.dropDu.bind(this)
    this.createBadge = this.createBadge.bind(this)
    this.socket = io('https://localhost:3000', {
      trasnports: [ 'polling' ]
    })
    this.socket.on('RECEIVE_MESSAGE', (data) => {
      this.createBadge(data)
      })
    
    this.socket.on('imOnline', (data) => {
      let login = localStorage.getItem('login')
      if (login === data) {
        this.setState({
          login: data
        })
      }
      this.socket.on('updateComplete/' + login, (data) => {
        if (login === data) {
          axios.post('/getAll/notif', {login})
          .then((result) => {
            if (result.data !== false) {
              let all = result.data.complete
              Object.keys(all).map(val => {
                if (all[val] !== 0) {
                  this.setState({
                    valid: false
                  })
                }
                return null
              })
            }
            else {
              window.location = '/'
            }
          })
        }
      })
      this.socket.on('SendState/' + this.state.login, (data) => {
        Object.keys(data).map((val) => {
          if (!this.state.contacts || !this.state.contacts[val]) {
            this.socket.emit('conv', data[val]['room'])
          }
          return null
        })
        this.setState({
          contacts: data
        })
      })
      this.socket.on('openDropMess/' + login, (data) => {
          this.setState({
            show: true
          })
      })
    })
    window.onmousedown = (e) => {
      let id = e.target.id
      this.setState({
        click: id
      })
    }
    window.onmouseup = (e) => {
      this.setState({
        click: false
      })
    }
  }
  
  createBadge = (data) => {
    if (data.emitter !== localStorage.login) {
      let emitter = data.emitter
      this.setState({
        contacts: {...this.state.contacts, [emitter]: {...this.state.contacts[emitter], badge: this.state.contacts[emitter]['badge'] ? this.state.contacts[emitter]['badge'] + 1 : 1}}
      })
    }
  }
  dropDu = (e) => {
    this.setState({
      show: !this.state.show
    })
  }
  
  toogleWindow = (e, id) => {
    if (id) {
      e.stopPropagation()
      if (!this.state.chatWindow[id]) {
        let curent = document.getElementById(id)
        let name = curent.getAttribute('login')
        let login = localStorage.getItem('login')
        let id_user = localStorage.getItem('id')
        this.socket.emit('ReadMessage', {id, name, login})
        this.socket.emit('SendNewNotif', { id_user, login_user: login })
        this.setState({
          chatWindow: {...this.state.chatWindow, [id]: name}
        })
      }
    } else {
      if (!this.state.chatWindow[e.target.id]) {
        id = e.target.id
        let name = e.target.getAttribute('login')
        let login = localStorage.getItem('login')
        let id_user = localStorage.getItem('id')
        this.socket.emit('ReadMessage', {id, name, login})
        this.socket.emit('SendNewNotif', { id_user, login_user: login })
        this.setState({
          chatWindow: {...this.state.chatWindow, [id]: name}
        })
      }
    }
  }

  deleteConv = (e) => {
    let id = e.target.id
    delete this.state.chatWindow[id]
    this.setState({
      chatWindow: {...this.state.chatWindow}
    })
  }

  render () {
    const { login, valid }= this.state
    if (login && valid) {
      return (
        <div className='DropUp'>
          <div>
            <ChatWindow windows={this.state.chatWindow} deleteConv={this.deleteConv} click={this.state.click} socket={this.socket}/>
          </div>
          <ContactButton contacts={this.state.contacts} toggleDU={this.dropDu} show={this.state.show} toggleWindow={this.toogleWindow} />
        </div>
      )
    }
    else {
      return ( <div /> )
    }
  }
}

export default DropUpContact
