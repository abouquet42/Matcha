import React from 'react';
import { Container, Row, Col, Input, Button } from 'mdbreact';
import './forgot.css'
import axios from 'axios'
const reg = {}
reg['pwd'] = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{6,})")
reg['pwdmin'] = new RegExp("^(?=.*[a-z])")
reg['pwdmaj'] = new RegExp("^(?=.*[A-Z])")
reg['pwdnum'] = new RegExp("^(?=.*[0-9])")
reg['pwdspe'] = new RegExp("^(?=.*[!@#\\$%\\^&\\*])")
reg['pwdlen'] = new RegExp("^(?=.{6,})")

class Forgot extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			login: '',
			mail: '',
			valid: false			
		}
		this.onChange = this.onChange.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
	}
	onChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value
		})
	}

	onSubmit = (e)  => {
		e.preventDefault()
    // get our form data out of state
    const {login, mail} = this.state;
    axios.post('/forgot', {login, mail})
      .then((result) => {
        this.setState({
        	valid: [result.data]
        })
	  })
	}

	render () {
		const valid = this.state.valid
    return(
			<div className='home-center'>
				<div id='content-prof'>
					<div id='profil-content'>
						<div className='main-info'>
							<p className='fa-2x ml-4 mb-4 mt-4'>Reset password</p>
						</div>
						<div className='mainProf'>
							<Container>
								<Row className='test'>
									<Col md="6">
										<form>
											<p className="h5 text-center mb-4 mt-4">Forgot password</p>
											<div className="grey-text">
												<Input label="Your Login" icon="user" group type="text" validate error="wrong" success="right" name="login" onChange={this.onChange}/>
												<Input label="Your email" icon="envelope" group type="email" validate error="wrong" success="right" name="mail" onChange={this.onChange}/>
											</div>
											{valid && 
											<span>{valid}</span>
											}
											<div className="text-center">
												<Button color="primary" onClick={this.onSubmit}>Send mail</Button>
											</div>
										</form>
									</Col>
								</Row>
							</Container>
						</div>
          </div>
        </div>
      </div>
    );
  }
}

class ChangePassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pwd: '',
			cpwd: '',
			valid: false,
			token: '',
			formValidate: {},
      message: null,
      pwdClass: {letter: 'invalid', capital: 'invalid', number: 'invalid', spec: 'invalid', length: 'invalid', gen: '1px solid red'}
		}
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}
	componentDidMount() {
		axios.get(window.location.pathname)
			.then((result) => {
				if (result.data === false)
					window.location = '/'
				else {
					this.setState({
						token: result.data
					});
				}

			})
	}
	onChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value
		})
		let forms = this.state.formValidate
    if ((e.target.name === 'pwd' && reg['pwd'].test(e.target.value)) || (e.target.name === 'cpwd' && reg['pwd'].test(e.target.value) && e.target.value === this.state.pwd)) {
        forms[e.target.name] = 'valid'
    } else {
      forms[e.target.name] = 'invalid'
    }
    if (e.target.name === 'pwd' && reg['pwd'].test(e.target.value) && e.target.value === this.state.cpwd) {
      forms['cpwd'] = 'valid'
    } else if (e.target.name === 'pwd') {
      forms['cpwd'] = 'invalid'
    }
    this.setState({
      formValidate: forms
    })
    if (e.target.name === 'pwd') {
      let classes = {}
      classes['show'] = 'block'
      if (reg['pwd'].test(e.target.value)) {
          classes['gen'] = '1px solid green'
      } else {
        classes['gen'] = '1px solid red'
      }
      if (reg['pwdmin'].test(e.target.value)) {
        classes['letter'] = 'valid'
      } else {
        classes['letter'] = 'invalid'
      }
      if (reg['pwdmaj'].test(e.target.value)) {
        classes['capital'] = 'valid'
      } else {
        classes['capital'] = 'invalid'
      }
      if (reg['pwdnum'].test(e.target.value)) {
        classes['number'] = 'valid'
      } else {
        classes['number'] = 'invalid'
      }
      if (reg['pwdspe'].test(e.target.value)) {
        classes['spec'] = 'valid'
      } else {
        classes['spec'] = 'invalid'
      }
      if (reg['pwdlen'].test(e.target.value)) {
        classes['length'] = 'valid'
      } else {
        classes['length'] = 'invalid'
      }
      this.setState({
        pwdClass: classes
      })
    }
	}

	onSubmit = (e)  => {
		e.preventDefault();
		const {pwd, cpwd} = this.state;
		axios.get('/forgot/res/' + this.state.token + '&' + pwd + '&' + cpwd) 
    		.then((result) => {
					if (result.data === 'Password has been updated !') {
						setTimeout(() => {
							this.props.history.push('/')
						}, 5000)
					}
					this.setState({
						valid: [result.data]
					})
	      })
	}

	ShowInfo = (e) => {
    this.setState({
      pwdClass: {...this.state.pwdClass, show: 'block'}
    })
  }

  HideInfo = (e) => {
    this.setState({
      pwdClass: {...this.state.pwdClass, show: 'none'}
    })
  }
	render() {
	const { formValidate, pwdClass, valid } = this.state
	let applyChanges = 0
	let apply = 'outline-danger'
	Object.keys(formValidate).map((key) => {
		if (formValidate[key] === 'valid')
			applyChanges += 1
		if (applyChanges === 2) apply = 'primary'
		else apply = 'outline-danger'
		return null
	})
    return(
			<div className='home-center'>
				<div id='content-prof'>
					<div id='profil-content'>
						<div className='main-info'>
							<p className='fa-2x ml-4 mb-4 mt-4'>Reset password</p>
						</div>
						<div className='mainProf'>
							<Container>
								<Row className='test'>
									<Col md="6">
										<form>
											<p className="h5 text-center mb-4 mt-4">Set a new password</p>
											<div className="grey-text">
												<Input label="New password" icon="lock" group type="password" validate name="pwd" onChange={this.onChange} className={`form-control validate ${formValidate['pwd']}`} onFocus={this.ShowInfo} onBlur={this.HideInfo}/>
												<div id='pswd_info' style={{border: pwdClass['gen'], display: pwdClass['show']}}>
                          <h4>Password must meet the following requirements:</h4>
                          <ul>
                            <li id='letter' className={pwdClass['letter']}>At least <strong>one letter</strong></li>
                            <li id='capital' className={pwdClass['capital']}>At least <strong>one capital letter</strong></li>
                            <li id='number' className={pwdClass['number']}>At least <strong>one number</strong></li>
                            <li id='spec' className={pwdClass['spec']}>At least <strong>one special character</strong></li>
                            <li id='length' className={pwdClass['length']}>Be at least <strong>6 characters</strong></li>
                          </ul>
                        </div>
												<Input className={`form-control validate ${formValidate['cpwd']}`} label="Confirm" icon="lock" group type="password" validate name="cpwd" onChange={this.onChange}/>
											</div>
											{valid ?
											<span>{valid}</span> : ''
											}
											<div className="text-center">
												<Button color={apply} disabled={applyChanges === 2 ? false : true} onClick={this.onSubmit}>Change password</Button>
											</div>
										</form>
									</Col>
								</Row>
							</Container>
						</div>
          </div>
        </div>
      </div>
    );
  }
}

export  {
	Forgot,
	ChangePassword
}
