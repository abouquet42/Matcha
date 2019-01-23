import React from 'react'
import axios from 'axios'
import Badge from '@material-ui/core/Badge'
import CircularProgressbar from 'react-circular-progressbar'

class NotifCenter extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      spec: false,
      liked: 0,
      visit: 0,
      message: 0,
      match: 0,
      unmatch: 0,
      hover: null,
      close: null
    }
    this.toggleSpec = this.toggleSpec.bind(this)
    this.handleHover = this.handleHover.bind(this)
    this.socket = this.props.socket
    let login = localStorage.login
    this.socket.on('updateComplete/' + login, (data) => {
      if (login === data) {
        axios.post('/getAll/notif', {login})
        .then((result) => {
          if (result.data !== false) {
            let all = result.data
            this.setState({
              liked: all.liked,
              visit: all.visit,
              message: all.message,
              matched: all.matched,
              matchNot: all.matchNot,
              comp: all.comp,
              complete: all.complete
            })
          }
          else {
            window.location = '/'
          }
        })
      }
    })
  }

  toggleSpec = (e) => {
    this.setState({
      spec: !this.state.spec
    })
  }
  
  componentWillMount = () => {
    let login = localStorage.login
    if (login && login !== null) {
      axios.post('/getAll/notif', {login})
        .then((result) => {
          if (result.data !== false) {
            let all = result.data
            this.setState({
              liked: all.liked,
              visit: all.visit,
              message: all.message,
              matched: all.matched,
              matchNot: all.matchNot,
              comp: all.comp,
              complete: all.complete
            })
          }
          else {
            window.location = '/'
          }
        })
    }
  }
  
  handleHover = (e, name) => {
    e.preventDefault()
    this.setState({
      hover: name
    })
  }

  handleUnHover = (e) => {
    e.preventDefault()
    this.setState({
      hover: null
    })
  }

  handleHoverClose = (e, name) => {
    e.preventDefault()
    this.setState({
      close: name
    })
  }

  handleUnHoverClose = (e) => {
    e.preventDefault()
    this.setState({
      close: null
    })
  }

  closeNotif = (e, name) => {
    e.preventDefault()
    e.stopPropagation()
    if (name) {
      this.setState({
        [name]: 0
      })
      let login = localStorage.login
      axios.post('/Delete/notif', {name, login})
        .then((result) => {
          if (result.data !== 'ok')
            window.location = '/'
        })
    }
  }

  render () {
    const {spec, liked, visit, message, matched, matchNot, hover, close, comp, complete} = this.state
    let login = localStorage.login
    let all = 0
    all += liked + message + matched + matchNot + visit
    let notComplete = false
    if (complete) {
      Object.keys(complete).map((val) => {
        if (complete[val] !== 0)
          notComplete = true
        return null
      })
    }
    return (
      <div>
        <div onClick={this.toggleSpec} className={spec === false ? "backDes" : "backDes acti" } />
        <div className={spec === false ? "toggleNotif" : "toggleNotif acti" }>
          <div className="buttons-container">
            <button id='spec' onClick={this.toggleSpec} type="button" aria-label="Toggle Navigation" className={spec === false ? "grid-button rearrange" : "grid-button rearrange spec" }>
              <span className="grid"></span>
              {notComplete === true ?
              <Badge badgeContent={'!'} color="error" style={{top: -33, right: -16, border: `2px solid red`}}>
                <div />
              </Badge>
              : all > 0 ?
              <Badge badgeContent={all} color="error" style={{top: -33, right: -16, border: `2px solid red`}}>
                <div />
              </Badge> : ''}
            </button>
          </div>
          <div className={spec === false ? "notif-Content" : "notif-Content acti" }>
            <div style={{width: '100%', display: 'flex', flexWrap: 'no-wrap', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
              <span>Profil completion</span>
              <div style={{width: '50%', textAlign: 'center'}} className='mb-3'>
                <CircularProgressbar
                  percentage={comp}
                  text={`${comp}%`}
                  />
              </div>
            </div>
            {complete && complete['prof'] !== 0 ?
              <div id='prof' className='notification' style={{backgroundColor: 'red', cursor: 'default'}} >
                <span>You need to complete your profil</span>
              </div>
            : '' }
            {complete && complete['img'] !== 0 ?
              <div id='img' className='notification' style={{backgroundColor: 'red', cursor: 'default'}} >
                <span>You need to upload at least one picture</span>
              </div>
            : '' }
            {complete && complete['loca'] !== 0 ?
              <div id='loca' className='notification' style={{backgroundColor: 'red', cursor: 'default'}} >
                <span>You need to set your location</span>
              </div>
            : '' }
            {complete && complete['orien'] !== 0 ?
              <div id='orien' className='notification' style={{backgroundColor: 'red', cursor: 'default'}} >
                <span>You need to refer your sexual orientation</span>
              </div>
            : '' }
            {all === 0 ?
              <span>You have no notification</span>
            : ''}
            {liked > 0 && notComplete === false ?
              <div id='like' className='notification' style={hover === 'like' ? {backgroundColor: 'rgba(78, 77, 77, 0.623)'} : {}} onMouseEnter={e => this.handleHover(e, 'like')} onMouseLeave={this.handleUnHover} onClick={e => {this.closeNotif(e, 'liked'); window.location = '/profil?visit'}} >
                <span>You have <span style={{color: 'red'}}>{liked}</span> new like{liked > 1 ? 's' :''} on your profil</span>
                  <div style={{position: 'relative'}}>
                  <div className='close-notif' style={close === 'like' ? {color: 'red', cursor: 'pointer'} : {}} onMouseEnter={e => this.handleHoverClose(e, 'like')} onMouseLeave={this.handleUnHoverClose} onClick={e => this.closeNotif(e, 'liked')}>
                    <span>x</span>
                  </div>
                </div>
              </div>
            : ''}
            {message > 0 && notComplete === false ?
              <div id='mess' className='notification' style={hover === 'mess' ? {backgroundColor: 'rgba(78, 77, 77, 0.623)'} : {}} onMouseEnter={e => this.handleHover(e, 'mess')} onMouseLeave={this.handleUnHover}  onClick={e => {this.closeNotif(e, 'message'); this.toggleSpec(); this.socket.emit('openMess', login)}}>
                <span>You have <span style={{color: 'red'}}>{message}</span> new message{message > 1 ? 's' :''}</span>
                  <div style={{position: 'relative'}}>
                  <div className='close-notif' style={close === 'mess' ? {color: 'red', cursor: 'pointer'} : {}} onMouseEnter={e => this.handleHoverClose(e, 'mess')} onMouseLeave={this.handleUnHoverClose} onClick={e => this.closeNotif(e, 'message')}>
                    <span>x</span>
                  </div>
                </div>
              </div>
            : ''}
            {matched > 0 && notComplete === false ?
              <div id='match' className='notification' style={hover === 'match' ? {backgroundColor: 'rgba(78, 77, 77, 0.623)'} : {}} onMouseEnter={e => this.handleHover(e, 'match')} onMouseLeave={this.handleUnHover}  onClick={e => {this.closeNotif(e, 'matched'); window.location = '/profil?match'}}>
                <span>You have <span style={{color: 'red'}}>{matched}</span> new match{matched > 1 ? 's' :''} on your profil</span>
                  <div style={{position: 'relative'}}>
                  <div className='close-notif' style={close === 'match' ? {color: 'red', cursor: 'pointer'} : {}}  onMouseEnter={e => this.handleHoverClose(e, 'match')} onMouseLeave={this.handleUnHoverClose} onClick={e => this.closeNotif(e, 'matched')}>
                    <span>x</span>
                  </div>
                </div>
              </div>
            : ''}
            {matchNot > 0 && notComplete === false ?
              <div id='unmatch' className='notification' style={hover === 'unmatch' ? {backgroundColor: 'rgba(78, 77, 77, 0.623)'} : {}} onMouseEnter={e => this.handleHover(e, 'unmatch')} onMouseLeave={this.handleUnHover}>
                <span>You have <span style={{color: 'red'}}>{matchNot}</span> unmatch{matchNot > 1 ? 's' :''} on your profil</span>
                  <div style={{position: 'relative'}}>
                  <div className='close-notif' style={close === 'unmatch' ? {color: 'red', cursor: 'pointer'} : {}} onMouseEnter={e => this.handleHoverClose(e, 'unmatch')} onMouseLeave={this.handleUnHoverClose} onClick={e => this.closeNotif(e, 'matchNot')}>
                    <span>x</span>
                  </div>
                </div>
              </div>
            : ''}
            {visit > 0 && notComplete === false ?
              <div id='visit' className='notification' style={hover === 'visit' ? {backgroundColor: 'rgba(78, 77, 77, 0.623)'} : {}} onMouseEnter={e => this.handleHover(e, 'visit')} onMouseLeave={this.handleUnHover} onClick={e => {this.closeNotif(e, 'visit'); window.location = '/profil?visit'}}>
                <span><span style={{color: 'red'}}>{visit}</span> user{visit > 1 ? 's' :''} visited your profil</span>
                  <div style={{position: 'relative'}}>
                  <div className='close-notif' style={close === 'visit' ? {color: 'red', cursor: 'pointer'} : {}} onMouseEnter={e => this.handleHoverClose(e, 'visit')} onMouseLeave={this.handleUnHoverClose} onClick={e => this.closeNotif(e, 'visit')}>
                    <span>x</span>
                  </div>
                </div>
              </div>
            : ''}
          </div>
        </div>
      </div>
    )
  }
}

export default NotifCenter
