// eslint-disable-next-line 
import React, { Component } from 'react'
// eslint-disable-next-line 
import  { Redirect } from 'react-router-dom'
// import logo from './logo.svg'
import logo from './heart.png'
import axios from 'axios'
import './header.css'
import Snackbar from '@material-ui/core/Snackbar'
import NotifCenter from './notif/notifCenter'
// import { locale } from './node_modules/moment/moment';

class Header extends React.Component  {
	constructor(props) {
		super(props);
		this.state = {
			response: '',
			open: false,
			vertical: 'top',
			horizontal: 'right',
			notif: [],
			notifMes: '',
			user: null
		}
		this.socket = this.props.socket
		this.socket.on('error', function (err) {
			console.log('received socket error:')
			console.log(err)
		})
		this.socket.on('Connect_failed', function (err) {
			console.log('received socket error:')
			console.log(err)
		})
		this.socket.on('imOnline', (data) => {
      if (data === localStorage.login) {
				let login = localStorage.getItem('login')
				if (this.state.user === null)
					this.setState({
						user: login
					})
        this.socket.on('SendNotifs/' + login, (data, NbNotifs) => {
          this.setState({
            notif: data[0],
            notifMes: data.results[1],
            open: true
          })
				})
				this.socket.on('updateComplete/' + login, (data) => {
					if (login === data) {
						axios.post('/getAll/notif', {login})
						.then((result) => {
							if (result.data !== false) {
								let all = result.data.complete
								Object.keys(all).map(val => {
									if (all[val] !== 0) {
										if (window.location.pathname !== '/profil')
											window.location = '/profil'
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
      }
    })
		
		window.onbeforeunload = (event) => {
			let login = localStorage.getItem('login')
			if (login)
				this.socket.emit('/jepars', login)
		}
	}
	
	handleClose = () => {
		this.setState({ open: false });
	}

	componentWillMount() {
		let login = localStorage.getItem('login')
		if (login) {
			axios.post('/Check/UserConnect', {login})
				.then((result) => {
					if (result.data === true) {
					axios.post('/initNotif', {init: true})
					this.socket.emit('setState/online', login)
					axios.post('/getAll/notif', {login})
					.then((result) => {
						if (result.data !== false) {
							let all = result.data.complete
							Object.keys(all).map(val => {
								if (all[val] !== 0) {
									if (window.location.pathname !== '/profil')
										window.location = '/profil'
								}
								return null
							})
						}
						else {
							window.location = '/'
						}
					})
					} else {
						localStorage.removeItem('login')
						localStorage.removeItem('id')
						window.location = '/'
					}
				})
		}
	}
	
	componentWillUpdate = () => {
		let login = localStorage.getItem('login')
		if (login)
	    this.socket.emit('setState/online', login)
	}

	Index = (e) => {
		e.preventDefault();
		window.location = "/"
	}
  render() {
		const { vertical, horizontal, open, notifMes, user } = this.state
    return(
      <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" onClick={this.Index}/>
        <h1 className="App-title">Welcome {localStorage.getItem('login') ? localStorage.getItem('login') : 'to Matcha'}</h1>
          {!user ? '' :
				<div>
				<Snackbar
					anchorOrigin={{ vertical, horizontal }}
					open={open}
					autoHideDuration={5000}
					onClose={this.handleClose}
					ContentProps={{
						'aria-describedby': 'message-id',
					}}
					message={<span id="message-id">{notifMes}</span>}
				/>
				<NotifCenter socket={this.socket}/>
				</div>
			}
      </header>
      </div>
    )
  }
}

export default Header
