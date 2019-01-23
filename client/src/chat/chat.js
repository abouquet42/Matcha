import React from 'react'
import {Button} from 'mdbreact'
import axios from 'axios'
import Emoji from './emoji'
import JSEMOJI from 'emoji-js'
// import io from 'socket.io-client'
let jsemoji = new JSEMOJI()
// set the style to emojione (default - apple)
jsemoji.img_set = 'emojione'
// set the storage location for all emojis
jsemoji.img_sets.emojione.path = 'https://cdn.jsdelivr.net/emojione/assets/3.0/png/32/';
// import io from 'socket.io-client'

class ChatWindow extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      windows: this.props.windows,
      message: null,
      current: {},
      conversation: {},
      emojiShow: null,
      curInputFocus: null
    }
    this.toggleWindow = this.toggleWindow.bind(this)
    this.socket = props.socket
    this.sendMess = this.sendMess.bind(this)
    this.addMessage = this.addMessage.bind(this)
    this.socket.on('RECEIVE_MESSAGE', (data) => {
      this.addMessage(data)
      })
    }

    addMessage = (data) => {
      let conv = data['room']
      let id = conv
      let uid = data['emitter']
      let login = localStorage.getItem('login')
      if (this.state.curInputFocus === conv)
        this.socket.emit('ReadMessage', {id, uid, login})
      axios.post('/get/Conversation', {conv})
      .then((result) => {
        this.setState({
          conversation: {...this.state.conversation, [conv]: result.data}
        })
      })
    }

    handleEmojiClick = (n, e) => {
      const cur = this.state.emojiShow
      let input = document.querySelectorAll('.messageContent input')
      let emoji = jsemoji.replace_colons(`:${e.name}:`);
      for (let i = 0; i < input.length; i++) {
        if (input[i].id === cur) {
          input[i].value += emoji
        }
      }
    }

    toogleEmojiState = (e, name, bool) => {
      if (bool === true) {
        this.setState({
          emojiShow: name === this.state.emojiShow ? null : name
        })
        if (e.target.className === 'show-emoji-yes') {
          e.target.className = 'show-emoji-no'
        }
        else {
          e.target.className = 'show-emoji-yes'
        }
      } else {
        this.setState({
          emojiShow: name === this.state.emojiShow ? null : this.state.emojiShow
        })
      }
    }
    componentWillReceiveProps = (news) => {
      this.setState({
      windows: news.windows
    })
    if (news.click !== false && news.click.length > 0) {
      this.setState({
        [news.click]: true
      })
      let conv = news.click;
      axios.post('/get/Conversation', {conv})
        .then((result) => {
          if (result.data.length > 0) {
            this.setState({
              conversation: {...this.state.conversation, [conv]: result.data}
            })
          }
        })
    }
  }

  componentWillMount = (e) => {
    this.setState({
      windows: this.props.windows
    })
  }

  componentDidUpdate = (e) => {
    let mess = document.querySelectorAll('.allMess')
    for (let i = 0; i < mess.length; i++) {
      mess[i].scrollTop = mess[i].scrollHeight
    }
  }
  

  toggleWindow = (e) => {
    e.preventDefault()
    let val = e.target.id
    this.setState({
      [val]: !this.state[val]
    })
  }

  genMessages = (name, copain) => {
    let conversation = this.state.conversation
    let login = localStorage.getItem('login')
    conversation = conversation[name]
    let current = null
    let allMess = null
    if (conversation) {
      allMess = Object.keys(conversation).map((val, index) => {
        let previous = current
        const emitter = conversation[val]['emitter']
        const message = conversation[val]['message']
        current = emitter
        return (
          <div key={index} className={current !== login ? 'leftMsg' : 'rightMsg'}>
            {previous !== emitter ? <div className='hr'>{emitter}</div> : ''}
            <span style={{wordWrap: 'break-word'}}>{message}</span>
          </div>
        )
      })
    }
    return allMess
  }

  sendMess = (e) => {
    if (e.key === 'Enter') {
      let message = e.target.value
      if (message.length > 0) {
        e.target.value = ''
        let login = localStorage.getItem('login')
        let room = e.target.id
        let res = {}
        res['room'] = room
        res['mess'] = message
        res['login'] = login
        this.socket.emit('SEND_MESSAGE', res)
      }
    }
  }

  readMess = (e, windows, names) => {
    let id = names
    let name = windows[names]
    let login = localStorage.getItem('login')
    this.setState({
      curInputFocus: id
    })
    this.socket.emit('ReadMessage', {id, name, login})
  }

  render () {
    let mess = document.querySelectorAll('.allMess')
    for (let i = 0; i < mess.length; i++) {
      mess[i].scrollTo = 1256
    }
    const {windows, emojiShow} = this.state

    let all = Object.keys(windows).map((name, index) =>
      <div key={name} style={{ margin: '0 5px 0 5px', alignSelf: 'flex-end', zIndex: '8' }} className='buttonDropUp' >
        <div key={name} style={{ position: 'relative', height: '24px', top: '0px' }} className='buttonDropUp' >
          <Button onClick={this.toggleWindow} style={{ minWidth: '100%', height: '24px', padding: '0', margin: '0' }} id={name} color="primary" className='buttonDropUp' >
          <div>
            <span key={name}>{windows[name]}</span>
          </div>
        </Button>
        <span style={{cursor: 'pointer', position:'absolute', left:'4px', color: 'black'}} onClick={e => {e.preventDefault(); window.location = '/user?' + windows[name]}} ><i className="fas fa-user-astronaut"></i></span>
        <span style={{cursor: 'pointer', position:'absolute', right:'4px', color: 'red'}} id={name} onClick={this.props.deleteConv}>x</span>
        </div>
        <div className='messageContent buttonDropUp' style={this.state[name] ? {height: '300px', visibility: 'visible'} : {height: '0px', visibility: 'hidden'}}>
          <div className='allMess'>
            {this.genMessages(name, windows[name])}
          </div>
          <input id={name} onFocus={(e) => {this.toogleEmojiState(e, name, false); this.readMess(e, windows, name)}} onKeyPress={this.sendMess} placeholder='your message' style={{height: '100%', maxHeight: '35px'}}/>
          <span className="show-emoji-no" onClick={(e) => this.toogleEmojiState(e, name, true)}>{'😎'}</span>
          { emojiShow === name ?
          <div className="emoji-table" id={'emoji' + name} style={{display: 'block'}}>
            <Emoji handle={this.handleEmojiClick} />
          </div> : ''}
        </div>
      </div>
      )
      return (
        <div style={{display: 'flex'}}>
          {all}
        </div>
      )
  }
}

export default ChatWindow
