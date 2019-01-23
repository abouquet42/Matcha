import React from 'react';
import { Container, Row, Col, Input, Button } from 'mdbreact';
import './signup.css'
import axios from 'axios'
const reg = {}
reg['login'] = new RegExp(`^([a-zA-Z0-9-_]{2,36})$`)
// eslint-disable-next-line
reg['email'] = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
reg['fname'] = new RegExp(`^(?=.*[A-Za-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸ])[áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸA-Za-z _-]*$`)
reg['lname'] = reg['fname']
reg['pwd'] = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{6,})")
reg['pwdmin'] = new RegExp("^(?=.*[a-z])")
reg['pwdmaj'] = new RegExp("^(?=.*[A-Z])")
reg['pwdnum'] = new RegExp("^(?=.*[0-9])")
reg['pwdspe'] = new RegExp("^(?=.*[!@#\\$%\\^&\\*])")
reg['pwdlen'] = new RegExp("^(?=.{6,})")

class SuPage extends React.Component  {
  constructor() {
    super();
    this.state = {
      login: '',
      fname: '',
      lname: '',
      email: '',
      pwd: '',
      pwdconf: '',
      formValidate: {},
      message: null,
      pwdClass: {letter: 'invalid', capital: 'invalid', number: 'invalid', spec: 'invalid', length: 'invalid', gen: '1px solid red'}
    }
    this.Checkpwd = this.Checkpwd.bind(this)
  }

  onChange = (e) => {
    this.setState({[e.target.name]: e.target.value})
    if (reg[e.target.name].test(e.target.value)) {
      if (e.target.name === 'login') {
        axios.post('/Check/login', {login: e.target.value})
          .then((result) => {
            if (result.data === 'ok') {
              this.setState({
                formValidate: {...this.state.formValidate, login: 'valid'}
              })
            } else {
              this.setState({
                formValidate: {...this.state.formValidate, login: 'invalid'}
              })
            }
          })
      } else if (e.target.name === 'email') {
        axios.post('/Check/email', {mail: e.target.value})
          .then((result) => {
            if (result.data === 'ok') {
              this.setState({
                formValidate: {...this.state.formValidate, email: 'valid'}
              })
            } else {
              this.setState({
                formValidate: {...this.state.formValidate, email: 'invalid'}
              })
            }
          })
      } else {
          this.setState({
            formValidate: {...this.state.formValidate, [e.target.name]: 'valid'}
          })
        }
    } else {
      this.setState({
        formValidate: {...this.state.formValidate, [e.target.name]: 'invalid'}
      })
    }
  }

  onSubmit = (e) => {
    e.preventDefault()
    const {login, fname, lname, email, pwd, pwdconf} = this.state
    if (Object.keys(this.state.formValidate).length === 6) {
      axios.post('/create_user', {login, fname, lname, email, pwd, pwdconf})
        .then((result) => {
          this.setState({
            message: result.data
          })
        })
    } else {
      this.setState({
        formValidate: {...this.state.formValidate}
      })
    }
  }

  Checkpwd = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
    let forms = this.state.formValidate
    if ((e.target.name === 'pwd' && reg['pwd'].test(e.target.value)) || (e.target.name === 'pwdconf' && reg['pwd'].test(e.target.value) && e.target.value === this.state.pwd)) {
        forms[e.target.name] = 'valid'
    } else {
      forms[e.target.name] = 'invalid'
    }
    if (e.target.name === 'pwd' && reg['pwd'].test(e.target.value) && e.target.value === this.state.pwdconf) {
      forms['pwdconf'] = 'valid'
    } else if (e.target.name === 'pwd') {
      forms['pwdconf'] = 'invalid'
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
    const {formValidate, pwdClass, message} = this.state
    let applyChanges = 0
    let apply = 'outline-danger'
    Object.keys(formValidate).map((key) => {
      if (formValidate[key] === 'valid')
        applyChanges += 1
      if (applyChanges === 6) apply = 'primary'
      else apply = 'outline-danger'
      return null
    })
    return(
      <div className='home-center'>
        <div id='content-prof'>
          <div id='profil-content'>
            <div className='main-info'>
              <p className='fa-2x ml-4 mb-4 mt-4'>Sign up</p>
            </div>
            <div className='mainProf'>
              <Container>
                <Row className='test'>
                  <Col md="6">
                    <form>
                      <div className="grey-text md-form">
                        <Input label="Your Login" icon="user" group type="text" validate name="login" onChange={this.onChange} className={`${formValidate['login']}`}/>
                        <Input label="Your first name" icon="user" group type="text" validate name="fname" onChange={this.onChange} className={`form-control validate ${formValidate['fname']}`}/>
                        <Input label="Your last name" icon="user" group type="text" validate name="lname" onChange={this.onChange} className={`form-control validate ${formValidate['lname']}`}/>
                        <Input label="Your email" icon="envelope" group type="email" validate name="email" onChange={this.onChange} className={`form-control validate ${formValidate['email']}`}/>
                        <Input label="Your password" icon="lock" group type="password" validate name="pwd" onChange={this.Checkpwd} className={`form-control validate ${formValidate['pwd']}`} onFocus={this.ShowInfo} onBlur={this.HideInfo}/>
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
                        <Input label="Confirm Your password" icon="lock" group type="password" validate name="pwdconf" onChange={this.Checkpwd} className={`form-control validate ${formValidate['pwdconf']}`}/>
                      </div>
                        {message !== null ?
                          <div className="text-center mb-2">
                            <span><h3>{message}</h3></span>
                          </div>
                        : ''}
                      <div className="text-center">
                        <Button color={apply} disabled={applyChanges === 6 ? false : true} onClick={this.onSubmit}>Register</Button>
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
};

export default SuPage;
