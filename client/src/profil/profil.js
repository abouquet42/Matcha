import React from 'react'
import { Fa, Input, Button } from 'mdbreact'
import './profil.css'
import axios from 'axios'
import moment from 'moment'
import { Modal, ModalBody, ModalHeader, ModalFooter } from 'mdbreact'
import Autocomplete from 'react-google-autocomplete'
import DropZone from '../dropzone/dropzone'
// eslint-disable-next-line
import { Line, Circle } from 'rc-progress'
import CircularIndeterminate from '../progress/progress'
import LocaButton from '../button/button'
import SimpleSelect from '../selector/orSelect'
import GenSelector from '../selector/genSelect'
import ModalPage from '../modal/selectPicModal'
import '../search/search.css'
import { WithContext as ReactTags } from 'react-tag-input'
import FolderList from './matchs'
import VisitTable from './visit'
import LikedTable from './liked'
import StarRatings from 'react-star-ratings'
import 'rc-steps/assets/index.css'
import 'rc-steps/assets/iconfont.css'
import SnackChange from './snackChange'
import Steps, { Step } from 'rc-steps'
let lat
let ln
let idMe = localStorage.getItem('id')
const reg = {}
reg['login'] = new RegExp(`^([a-zA-Z0-9-_]{2,36})$`)
// eslint-disable-next-line
reg['mail'] = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
reg['first_name'] = new RegExp(`^(?=.*[A-Za-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸ])[áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸA-Za-z _-]*$`)
reg['last_name'] = reg['first_name']
reg['pwd'] = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{6,})")
reg['pwdmin'] = new RegExp("^(?=.*[a-z])")
reg['pwdmaj'] = new RegExp("^(?=.*[A-Z])")
reg['pwdnum'] = new RegExp("^(?=.*[0-9])")
reg['pwdspe'] = new RegExp("^(?=.*[!@#\\$%\\^&\\*])")
reg['pwdlen'] = new RegExp("^(?=.{6,})")
reg['phone'] = /^(33|0)[1-9](\d{2}){4,}$/g
reg['activity'] = /^[a-zA-Z\s]{1,}$/

/*   Var pour les tags   */
function tagFormatter(v) {
  return `#${v}`;
}
const KeyCodes = {
  comma: 188,
  enter: 13,
}
const delimiters = [KeyCodes.comma, KeyCodes.enter]

class ProfilPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      passInfo: '',
      data: null,
      modal: false,
      resp: false,
      mount: false,
      pwdverif: false,
      pwdchange: '',
      newpass: '',
      newpassverif: '',
      pwdconf: false,
      selected: 'match',
      passchange: '',
      location: '',
      lat: '',
      ln: '',
      modAct: false,
      modInt: false,
      imageURL: '',
      active: false,
      upload: true,
      uploadMax: 0,
      allImg: false,
      remove: null,
      delete: false,
      waiting: false,
      orientation: '',
      ori: '',
      tags: [],
      suggestions: [],
      allMatchs : null,
      update: false,
      likeTable: null,
      visitTable: null,
      googleId: null,
      hasChanged: false,
      snackMess: null,
      snackVariant: null,
      formValidate: {},
      pwdClass: {letter: 'invalid', capital: 'invalid', number: 'invalid', spec: 'invalid', length: 'invalid', gen: '1px solid red'}
    }
    this.socket = this.props.socket
    this.Checkpwd = this.Checkpwd.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.toggle = this.toggle.bind(this)
    this.deleteAccount = this.deleteAccount.bind(this)
    this.ChangePwd = this.ChangePwd.bind(this)
    this.Selector = this.Selector.bind(this)
    this.activateModif = this.activateModif.bind(this)
    this.onInput = this.onInput.bind(this)
    this.onOutput = this.onOutput.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleAddition = this.handleAddition.bind(this)
    this.gotUpdate = this.gotUpdate.bind(this)
    this.setNotif = this.setNotif.bind(this)
    let login = localStorage.login
    this.socket.on('updateComplete/' + login, (data) => {
      if (login === data) {
        this.gotUpdate()
        axios.post('/getAll/notif', {login})
        .then((result) => {
          if (result.data !== false) {
            let all = result.data
            this.setState({
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

  CallLoca = async (e) => {
    this.setState({
      active: true,
      waiting: true
    })
    navigator.geolocation.getCurrentPosition(async (position, error) => {
      if (!error) {
        lat = position.coords.latitude
        ln = position.coords.longitude
        const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + ln + '&key=AIzaSyCKb5nHXbxWF6uj_Ehm-P65YZ95KqH8Tuw')
        const body = await response.json()
        if (response.status !== 200) throw Error(body.message)
        let place = body.results[0].place_id
        let location = body.results[0].formatted_address
        this.setState({
          location: location,
          waiting: false
        })
        let login = localStorage.getItem('login')
        this.SetNewLoca(place, login, location)
      } 
    }, async (PositionError) => {
      await axios.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCKb5nHXbxWF6uj_Ehm-P65YZ95KqH8Tuw')
      .then(async (result) => {
        lat = result.data.location.lat
        ln = result.data.location.lng
        const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + ln + '&key=AIzaSyCKb5nHXbxWF6uj_Ehm-P65YZ95KqH8Tuw')
        const body = await response.json()
        if (response.status !== 200) throw Error(body.message)
        let place = body.results[0].place_id
        let location = body.results[0].formatted_address
        this.setState({
          location: location,
          waiting: false
        })
        let login = localStorage.getItem('login')
        this.SetNewLoca(place, login, location)
      })
    })
  }

  SetNewLoca = (place, login, loca) => {
    axios.post('/update/location', {place, login})
    .then((result) => {
      if (result.data === 'good') {
        this.setState({
          location: loca ? loca : 'Please insert a location',
          hasChanged: true,
          snackMess: 'Location changed !',
          snackVariant: 'success'
        })
      } else {
        this.setState({
          location: loca ? loca : 'Please insert a location',
          hasChanged: true,
          snackMess: 'An error occured, please try again !',
          snackVariant: 'error'
        })
      }
    })
  }

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
    if (e.target.name !== 'genre' && e.target.name !== 'birthdate' && e.target.name !== 'bio' && e.target.name !== 'location') {
      if (reg[e.target.name].test(e.target.value) || e.target.value.length === 0) {
        if (e.target.name === 'login') {
          let login = localStorage.login
          if (!e.target.value || e.target.value.length === 0) {
            this.setState({
              formValidate: {...this.state.formValidate, login: 'invalid'}
            })
          } else {
            let value = e.target.value
            axios.post('/Check/login', {login: value, current: login})
              .then((result) => {
                if (result.data === 'ok' && value.length !== 0 ) {
                  this.setState({
                    formValidate: {...this.state.formValidate, login: 'valid'}
                  })
                } else {
                  this.setState({
                    formValidate: {...this.state.formValidate, login: 'invalid'}
                  })
                }
              })
            }
        } else if (e.target.name === 'mail') {
          axios.post('/Check/email', {mail: e.target.value})
            .then((result) => {
              if (result.data === 'ok' && e.target.value.length !== 0 ) {
                this.setState({
                  formValidate: {...this.state.formValidate, mail: 'valid'}
                })
              } else {
                this.setState({
                  formValidate: {...this.state.formValidate, mail: 'invalid'}
                })
              }
            })
        } else {
          if (e.target.value.length === 0) {
            this.setState({
              formValidate: {...this.state.formValidate, [e.target.name]: ''}
            })
          } else {
            this.setState({
              formValidate: {...this.state.formValidate, [e.target.name]: 'valid'}
            })
          }
        }
      } else {
        this.setState({
          formValidate: {...this.state.formValidate, [e.target.name]: 'invalid'}
        })
      }
    }
  }

  componentDidMount() {
    if (this.props.location.search.length > 0) {
      let sel = this.props.location.search.slice(1, this.props.location.search.length)
      let login = localStorage.login
      if (login) {
        axios.post('/GetSocialState', {login})
          .then((result) => {
            if (sel === 'pic' || sel === 'visit' || sel === 'all' || (sel === 'pass' && (result.data === null || result.data.length === 0))) {
              this.setState({
                selected: sel
              })
              if (sel === 'pic') {
                this.initPic()
              }
              if (sel === 'visit') {
                this.createData()
              }
            }
          })
        }
    }
  }
  

  componentWillMount = async () => {
    if (!localStorage.getItem('login'))
      window.location = '/'
    else {
      let login = localStorage.getItem('login')
      let id
      axios.post('/getAll', {login})
      .then((result) => {
        Object.keys(result.data[0]).map(key => {
          if (result.data[0][key] === null)
          result.data[0][key] = ''
          if (key === 'birthdate') {
            if (result.data[0][key].length === 0)
            result.data[0][key] = '2000-01-01'
            else
              result.data[0][key] = moment(result.data[0][key]).format('YYYY-MM-DD')
          }
          if (key === 'id')
            id = result.data[0][key]
            if (key !== 'genre' && key !== 'birthdate' && key !== 'id' && key !== 'created_at' && key !== 'password' && key !== 'bio' && key !== 'admin' && key !== 'googleId' && key !== 'token' && key !== 'profimg' && key !== 'discoDate') {
              if (result.data[0][key].length === 0 && key !== 'mail' && key !== 'login') {
                this.setState({
                  formValidate: {...this.state.formValidate, [key]: ''}
                })
              } else if (reg[key].test(result.data[0][key])) {
                this.setState({
                  formValidate: {...this.state.formValidate, [key]: 'valid'}
                })
              } else {
                this.setState({
                  formValidate: {...this.state.formValidate, [key]: 'invalid'}
                })
              }
            }
          this.setState({
            [key]: result.data[0][key]
          })
          return true;
        })
        this.setState({
          data: true
        })
        axios.post('/getAll/info', {id})
        .then(async (result) => {
          let location = result.data.location
          let ori = result.data.orientation === 'bi' ? 'Bisexuel' : result.data.orientation === 'homo' ? 'Homosexuel' : 'Hétérosexuel'
          if (location) {
              const resp = await fetch('https://maps.googleapis.com/maps/api/geocode/json?place_id=' + location + '&key=AIzaSyCKb5nHXbxWF6uj_Ehm-P65YZ95KqH8Tuw')
              const body = await resp.json()
              let addr = body.results[0].formatted_address
              this.setState({
                location: addr,
                active: true,
                ori: ori,
                orientation: result.data.orientation,
                popu: result.data.popu / 20
              })
            }
            else {
              this.setState({
                location: 'Please insert your location',
                active: true,
                ori: ori,
                orientation: result.data.orientation,
                popu: result.data.popu / 20 
              })
            }
          })
        axios.post('/getAll/matches', {id})
          .then((result) => {
            this.setState({
              allMatchs: result.data
            })
          })
      })
      axios.post('loadTagsSug', { idMe }).then((result) => {
        var obj = JSON.parse(result.data[0])
        this.setState({ suggestions: obj })
        if (result.data[1]) {
          var obj2 = JSON.parse(result.data[1])
          this.setState({ tags: obj2 })
        }
      })
    }
  }

  setNotif = (mess, variant) => {
    if (mess && variant) {
      this.setState({
        hasChanged: true,
        snackMess: mess,
        snackVariant: variant
      })
    }
  }
  gotUpdate = (e) => {
    if (!localStorage.getItem('login'))
      window.location = '/'
    else {
      let login = localStorage.getItem('login')
      let id
      axios.post('/getAll', {login})
      .then((result) => {
        Object.keys(result.data[0]).map(key => {
          if (result.data[0][key] === null)
            result.data[0][key] = ''
          if (key === 'birthdate') {
            if (result.data[0][key].length === 0)
              result.data[0][key] = '2000-01-01'
            else
              result.data[0][key] = moment(result.data[0][key]).format('YYYY-MM-DD')
          }
          if (key === 'id')
            id = result.data[0][key]
          this.setState({
            [key]: result.data[0][key]
          })
          return true;
        })
        this.setState({
          data: true
        })
        axios.post('/getAll/info', {id})
          .then(async (result) => {
            let location = result.data.location
            if (location) {
              const resp = await fetch('https://maps.googleapis.com/maps/api/geocode/json?place_id=' + location + '&key=AIzaSyCKb5nHXbxWF6uj_Ehm-P65YZ95KqH8Tuw')
              const body = await resp.json()
              let addr = body.results[0].formatted_address
              let ori = result.data.orientation === 'bi' ? 'Bisexuel' : result.data.orientation === 'homo' ? 'Homosexuel' : 'Hétérosexuel'
              this.setState({
                location: addr,
                active: true,
                ori: ori,
                orientation: result.data.orientation,
                popu: result.data.popu / 20 
              })
            }
          })
        axios.post('/getAll/matches', {id})
          .then((result) => {
            this.setState({
              allMatchs: result.data
            })
          })
      })
      axios.post('loadTagsSug', { idMe }).then((result) => {
        var obj = JSON.parse(result.data[0])
        this.setState({ suggestions: obj })
        if (result.data[1]) {
          var obj2 = JSON.parse(result.data[1])
          this.setState({ tags: obj2 })
        }
      })
    }
  }

  initPic = (e) => {
    let login = localStorage.getItem('login')
    axios.post('getImgs', {login})
    .then((result) => {
      if (result.data === 'no') {
        this.setState({
          upload: true,
          uploadMax: 5,
          allImg: true
        })
      }
      else {
        const all = {}
        Object.keys(result.data).map(key => {
          if (key === 'len') {
            let len = 5 - result.data[key]
              this.setState({
                upload: result.data[key] === 5 ? false : true,
                uploadMax: len
              })
            }
          else {
            all[key] = {}
            all[key].data = result.data[key]['data']
            all[key].id = result.data[key]['id']
          }
          return all
        })
        this.setState({
          allImg: all ? all : null
        })
        }
      })
  }

  onSubmit = (e) => {
    const {login, genre, first_name, last_name, mail, birthdate, phone, activity, bio, profimg, id} = this.state
    axios.post('/update/info', {login, genre, first_name, last_name, mail, birthdate, phone, activity, bio, profimg, id})
    .then((result) => {
      localStorage.removeItem('login')
      localStorage.setItem('login', login)
      this.socket.emit('setState/online', login)
      this.setState({
        passInfo: null,
        hasChanged: true,
        snackMess: 'Informations saved !',
        snackVariant: 'success'
      })

    })
  }
  Checkpwd = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
    let pwdNew = []
    pwdNew['newpass'] = this.state.newpass
    pwdNew['newpassverif'] = this.state.newpassverif
    pwdNew['act'] = null
    if (e.target.name === 'passInfo') {
      let login = localStorage.getItem('login')
      let pwd = e.target.value
      axios.post('/check/pwd', {login, pwd})
      .then((result) => {
        if (result.data === true) {
          this.setState({
            pwd: true
          })
        }
        else {
          this.setState({
            pwd: false
          })
        }
      })
    }
    else if (e.target.name === 'passchange') {
      this.setState({
        pwdchange: e.target.value
      })
      let login = localStorage.getItem('login')
      let pwd = e.target.value
      axios.post('/check/pwd', {login, pwd})
        .then((result) => {
          if (result.data === true) {
              this.setState({
                pwdverif: true
              })
          }
          else {
            this.setState({
              pwdverif: false
            })
          }
        })
    }
    else if (e.target.name === 'newpass' || e.target.name === 'newpassverif') {
      this.setState({
        [e.target.name]: e.target.value
      })
      let forms = this.state.formValidate
      if ((e.target.name === 'newpass' && reg['pwd'].test(e.target.value)) || (e.target.name === 'newpassverif' && reg['pwd'].test(e.target.value) && e.target.value === this.state.newpass)) {
          forms[e.target.name] = 'valid'
      } else {
        forms[e.target.name] = 'invalid'
      }
      if (e.target.name === 'newpass' && reg['pwd'].test(e.target.value) && e.target.value === this.state.newpassverif) {
        forms['newpassverif'] = 'valid'
      } else if (e.target.name === 'newpass') {
        forms['newpassverif'] = 'invalid'
      }
      this.setState({
        formValidate: forms
      })
      if (e.target.name === 'newpass') {
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
  }
  toggle = (e) => {
		this.setState({
    modal: !this.state.modal,
    delete: 'user'
		});
  }
  
  ChangePwd = (e) => {
    const {pwdchange, newpass, newpassverif} = this.state
    const login = localStorage.getItem('login')
    axios.post('/new/password', {login, pwdchange, newpass, newpassverif})
      .then((result) => {
          this.setState({
            pwdconf: result.data,
            // selected: null,
            newpass: '',
            newpassverif: '',
            pwdverif: false,
            passchange: ''
            })
          // this.setState({
          //   selected: 'pass'
          //   })
          let all = document.querySelectorAll('#form3 input')
          for (let i = 0 ;i < all.length; i++) {
            this.setState({
              [all[i].name]: ''
            })
            document.getElementById('pass').click()
          }
      })
  }

	deleteAccount = (e) => {
		const {id} = this.state
		axios.post('/delete/user', {id})
			.then((result) => {
				if (result.data !== true){

				}
				else {
					localStorage.removeItem('login')
					window.location = '/'
				}
			})
  }
  Selector = (e) => {
    if (e.target.id !== this.state.selected) {
      this.setState({
        selected: e.target.id
      })
      window.history.pushState(null, 'Profil', '/profil?' + e.target.id)
      if (e.target.id === 'pic') {
        this.initPic()
      }
      if (e.target.id === 'visit') {
        this.createData()
      }
    }
  }
  activateModif = (e) => {
    this.setState({
      modAct: !this.state.modAct
    })
  }
  activateModifInt = (e) => {
    this.setState({
      modInt: !this.state.modInt
    })
  }

  onInput = (e) => {
    this.setState({
      active: true
    })
    // if (e.target.value.length === 0)
    //   this.CallLoca()
  }

  onOutput = (e) => {
    if (e.target.value.length === 0) {
      this.setState({
        active: false
      })
    }
  }

  showDelete = (e) => {
    let id = e.target.id
    this.setState({
      remove: id
    })
  }

  unShowDelete = (e) => {
    this.setState({
      remove: null
    })
  }

  popUpDelete = (e) => {
    this.setState({
        modal: !this.state.modal,
        delete: e.target.id
      });
  }

  deleteImg = (e) => {
    let id = this.state.delete
    let login = localStorage.getItem('login')
    axios.post('/delete/img', {id, login})
    .then((result) => {
      if (result.data === 'good')
        this.initPic()
      this.setState({
        modal: !this.state.modal,
        delete: null,
        hasChanged: true,
        snackMess: 'Picture deleted !',
        snackVariant: 'success'
        })
      })
    }
    
    ChangeOrien = (e) => {
      this.setState({ [e.target.name]: e.target.value })
      let ori = e.target.value === 'bi' ? 'Bisexuel' : e.target.value === 'homo' ? 'Homosexuel' : 'Hétérosexuel'
      this.setState({
        ori: ori,
        hasChanged: true,
        snackMess: 'Orientation saved !',
        snackVariant: 'success'
      })
      let orient = e.target.value
      let login = localStorage.getItem('login')
    axios.post('/update/orient', {orient, login})
      .then((result) => {
    })
  }
  ChangeGender = (e) => {
    this.setState({ [e.target.name]: e.target.value })
    let genre = e.target.value
    this.setState({
      genre: genre,
      hasChanged: true,
      snackMess: 'Gender saved !',
      snackVariant: 'success'
    })
    let login = localStorage.getItem('login')
  axios.post('/update/gender', {genre, login})
    .then((result) => {
  })
}

  updateTags = (tags) => {
    const { id} = this.state
    axios.post('/update/tags', { id, tags })
      .then((result) => {
        this.setState({tags: tags})
      });
  }
  handleDelete(i) {
    const tags = this.state.tags.filter((tag, index) => index !== i)
    this.updateTags(tags)
  }
  handleAddition(tag) {
    const name = tag.text
    tag.text = tagFormatter(tag.text)
    const tags = this.state.tags
    tags.push({id: name, text: tag.text})
    this.updateTags(tags)
  }

  createData =  () => {
    let id = 0
    let login = localStorage.login
    axios.post('/getAll/likes', {login})
      .then((result) => {
        if (result.data === false) {
  
        } else if (result.data === null) {
  
        } else {
          let all = result.data
          let ret = []
          let tmp = null
          Object.keys(all).map(key => {
            tmp = all[key]
            ret[id] = {id, name: key, date: tmp}
            id += 1
            return null
          })
          this.setState({
            likeTable: ret
          })
        }
      })
      let idV = 0
      axios.post('/getAll/visits', {login})
      .then((resultV) => {
        if (resultV.data === false) {
  
        } else if (resultV.data === null) {
  
        } else {
          let allV = resultV.data
          let retV = []
          let last = null
          let number = null
          Object.keys(allV).map(keyV => {
            number = allV[keyV]['number']
            last = allV[keyV]['last']
            retV[idV] = {idV, name: keyV, number, last}
            idV += 1
            return null
          })
          this.setState({
            visitTable: retV
          })
        }
      })
  }

  changePage = (e, page) => {
    if (page)
      window.location = page
  }

  handleSnackClose = (event, reason) => {
    // if (reason === 'clickaway') {
    //   return
    // }

    this.setState({ hasChanged: false })
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
render () {
	const modalStyle = {
		maxWidth: '340px'
	}
	const modalBodyStyle = {
		display: 'flex',
		justifyContent: 'center'
	}
  const data = this.state.data
  // eslint-disable-next-line 
  let { passInfo, pwdClass, formValidate, googleId, complete, login, genre, first_name, last_name, created_at, mail, birthdate, phone, activity, bio, profimg, pwdconf, selected, location, modAct, modInt, allImg, ori, tags, suggestions } = this.state
  let ProfImgs = ''
  let notComplete = false
    if (data) {
      // genre = genre === 'Man' ? 1 : genre === 'Woman' ? 2 : genre === 'Other' ? 3 : genre
      if (allImg) {
        ProfImgs = Object.keys(allImg).map((img, index) =>
        <div key={index} className='picsProf m-3' style={{position: 'relative'}}>
          <img alt='pic' id={index} style={{width: '-webkit-fill-available'}} key={index} src={allImg[img].data} onMouseEnter={this.showDelete} />
          <div>
            <div onMouseLeave={this.unShowDelete} className={this.state.remove === index.toString() ? 'removePic' : 'not-show'} >
              <i className="far fa-trash-alt fa-4x removeThisPic" id={allImg[img].id} onClick={this.popUpDelete}></i>
            </div>
          </div>
        </div>
        )
      }
      let Good = []
      let notGood = []
      let currentComplete = 0
      let applyChanges = 0
      if (complete) {
        Object.keys(complete).map((val) => {
          if (complete[val] !== 0) {
            notComplete = true
            if (val === 'prof') notGood[0] = (<Step title="Infos" icon="user" status='error'/>)
            else if (val === 'img') notGood[1] = (<Step title="Image" icon="picture"  status='error'/>)
            else if (val === 'loca') notGood[2] = (<Step title="Location" icon={<i className="fas fa-map-marked-alt"></i>}  status='error'/>)
            else if (val === 'orien') notGood[3] = (<Step title='Orientation' icon={<i className="fas fa-transgender-alt"></i>}  status='error'/>)
          } else {
            currentComplete += 1
            if (val === 'prof') Good[0] = (<Step title="Infos" icon="user"/>)
            else if (val === 'img') Good[1] = (<Step title="Image" icon="picture" />)
            else if (val === 'loca') Good[2] = (<Step title="Location" icon={<i className="fas fa-map-marked-alt"></i>} />)
            else if (val === 'orien') Good[3] = (<Step title='Orientation' icon={<i className="fas fa-transgender-alt"></i>} />)
          }
          return null
        })
        Object.keys(formValidate).map((key) => {
          if (formValidate[key] === 'valid' || formValidate[key] === '')
            applyChanges += 1
          return null
        })
      }
      return (
        <div className='home-center'>
        <SnackChange change={this.state.hasChanged} mess={this.state.snackMess} handleClose={this.handleSnackClose} variant={this.state.snackVariant}/>
      {/* <Button color="primary" onClick={this.toggle3} >Small modal</Button> */}
      <Modal style={modalStyle} isOpen={this.state.modal} toggle={this.toggle} centered>
      <ModalHeader className='modalHeader' toggle={this.toggle}>Are you sure ?</ModalHeader>
      <ModalBody style={modalBodyStyle}>
              <i className="fa fa-times fa-4x animated rotateIn"></i>
      </ModalBody>
      <ModalFooter style={modalBodyStyle}>
        <div className="modal-footer flex-center">
        {this.state.delete === 'user' ? 
          <Button color="primary" onClick={this.deleteAccount}>Yes</Button>
        :
          <Button color="primary" onClick={this.deleteImg}>Yes</Button>
        }
        <Button color="danger" className="btn  btn-danger waves-effect" onClick={this.toggle}>No</Button>
                      </div>
      </ModalFooter>
      </Modal>
          <div id='content-prof'>
            <div id='profil-content'>
                <div className='main-info'>
                  <p className='fa-2x ml-4 mb-4 mt-4'>Account</p>
                </div>
                <div className='mb-2'>
                {notComplete === true ?
                <Steps labelPlacement="vertical" current={currentComplete} >
                  {Good[0] ? Good[0] : ''}
                  {Good[1] ? Good[1] : ''}
                  {Good[2] ? Good[2] : ''}
                  {Good[3] ? Good[3] : ''}
                  {notGood[0] ? notGood[0] : ''}
                  {notGood[1] ? notGood[1] : ''}
                  {notGood[2] ? notGood[2] : ''}
                  {notGood[3] ? notGood[3] : ''}
                </Steps>
                : '' }
                </div>
                <div className='mainProf'>
                  <div className='pic-content p-2'>
                      <div id='prof-img'>
                        <img src={profimg} alt='' id='imgmaggle' />
                        <ModalPage setNotif={this.setNotif}/>
                      </div>
                  </div>
                  <div className='NameProf m-2'>
                    <div className='nameStar'>
                      <span className='mb-2 h4'>{login}</span>
                      <StarRatings
                        rating={this.state.popu}
                        starRatedColor="orange"
                        starDimension="20px"
                        starSpacing="4px"
                        numberOfStars={5}
                        name='rating'
                      />
                    </div>
                    <div className='mainProf'>
                      <div className='info-content  p-2'>
                        <div id='mainEdit' className='info-main' onClick={this.activateModif}>
                          <span>Info</span>
                          <Fa id='editProf' icon='edit' className='mt-1 mr-1' />
                        </div>
                        {!modAct ?
                        <div className='ml-4 mt-3'>
                          {/* <span ><Fa icon='envelope' className='mr-1' />{mail}</span> */}
                          <span className='mt-1' style={{display: 'flex', alignItems: 'center'}}><i style={{marginLeft: '-5px'}} className="mt-1 icon-test mr-2 fas fa-user-circle"></i>{genre}</span>                          
                          <span className='mt-1' style={{display: 'flex', alignItems: 'center'}}><i style={{marginLeft: '-5px'}} className="mt-1 icon-test mr-2 fas fa-transgender-alt"></i>{ori}</span>
                          <span className='mt-1' style={{display: 'flex', alignItems: 'center'}}><Fa icon='map-marker' className='mr-2 icon-test' /> {location}</span>
                        </div>
                        :
                        <div className='ml-4 mt-3'>
                          <div className='test-form'>
                            <i className="fa-2x fas fa-user-circle"></i>
                            <GenSelector style={{width: '100%'}} onChange={this.ChangeGender} value={this.state.genre} />
                          </div>
                          <div className='test-form'>
                            {/* <Fa icon='map-marker' className='mr-2 fa-2x' /> */}
                            <i className="fa-2x fas fa-transgender-alt"></i>
                            <SimpleSelect style={{width: '100%'}} onChange={this.ChangeOrien} value={this.state.orientation}/>
                          </div>
                          <div className='md-form'>
                            <Fa icon='map-marker' className='ml-2 fa-2x prefix' />
                            <Autocomplete
                              placeholder=''
                              onFocus={this.onInput}
                              onBlur={this.onOutput}
                              onChange={this.onChange}
                              id='placeAuto'
                              name='location'
                              className='form-control'
                              input={<span />}
                              value={location ? location : ''}
                              type='text'
                              onPlaceSelected={(place) => {
                                let loca = place.formatted_address
                                let places = place.place_id
                                let login = localStorage.getItem('login')
                                this.SetNewLoca(places, login, loca)
                              }}
                              types={['geocode']}
                              componentRestrictions={{country: 'fr'}}
                            />
                            <label className={this.state.active ? 'active' : ''}>Enter a location </label>
                            <div>
                              <LocaButton loca={this.CallLoca}/>
                              {this.state.waiting ?
                                <CircularIndeterminate size={40} style={{outline: 'none', textDecoration: 'none', position: 'absolute', right: '0', top: '0', margin: '0', height: '38px', width: '38px'}}/>
                                : ''
                              }
                            </div>
                          </div>
                        </div>
                        }
                      </div>
                      <div className='int-content  p-2'>
                        <div id='mainEdit' className='info-main' onClick={this.activateModifInt}>
                          <span>Interests</span>
                          <Fa id='editProf' icon='edit' className='mt-1 mr-1' />
                        </div><br/>
                        {!modInt ?
                        <ReactTags inline tags={tags}
                          style={{ zIndex: '10000' }}
                          readOnly={true}
                          delimiters={delimiters}
                          classNames={{
                            tags: 'tagsClass',
                            selected: 'selectedClass',
                            tag: 'tagClass',
                          }}
                        />
                        :
                        <ReactTags inline tags={tags}
                          style={{ zIndex: '10000' }}
                          suggestions={suggestions}
                          handleDelete={this.handleDelete}
                          handleAddition={this.handleAddition}
                          delimiters={delimiters}
                          classNames={{
                            tags: 'tagsClass',
                            tagInput: 'tagInputClass',
                            tagInputField: 'tagInputFieldClass',
                            selected: 'selectedClass',
                            tag: 'tagClass',
                            remove: 'removeClass',
                            suggestions: 'suggestionsClass',
                            activeSuggestion: 'activeSuggestionClass'
                          }}
                        />
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div className='profSelector'>
                  <span id='match' className={selected === 'match' ? 'Selector selected' : 'Selector'} onClick={this.Selector} >Match</span>
                  <span id='pic' className={selected === 'pic' ? 'Selector selected' : 'Selector'} onClick={this.Selector} >Pictures</span>
                  <span id='all' className={selected === 'all' ? 'Selector selected' : 'Selector'} onClick={this.Selector} >All info</span>
                  {googleId.length === 0 ? <span id='pass' className={selected === 'pass' ? 'Selector selected' : 'Selector'} onClick={this.Selector} >Password</span> : '' }
                  <span id='visit' className={selected === 'visit' ? 'Selector selected' : 'Selector'} onClick={this.Selector} >Visits / Likes</span>
                </div>
              {selected === 'all' ?
              <div id='profil-info'>
                <div className='change-form'>
                  <form id='form2' method='POST'>
                    {/* <!-- Identity row --> */}
                    <div className='row' id='name-change'>
                      {/* <!--First column--> */}
                      <div className='col-md-6'>
                        <div className='md-form'>
                          <Input onChange={this.onChange} value={first_name} label='First name' name='first_name' type='text' id='form41' className={`form-control validate ${formValidate['first_name']}`} />
                        </div>
                      </div>

                      {/* <!--Second column--> */}
                      <div className='col-md-6'>
                        <div className='md-form'>
                          <Input onChange={this.onChange} value={last_name} label='Last name' name='last_name' type='text' id='form51' className={`form-control validate ${formValidate['last_name']}`} />
                        </div>
                      </div>
                    </div>
                    {/* <!--First row--> */}
                    <div className='row'>
                      {/* <!--First column--> */}
                      <div className='col-md-6'>
                        <div className='md-form'>
                          <Input onChange={this.onChange} value={mail} icon='envelope' label='Your email' name='mail' type='email' id='form81' className={`form-control validate ${formValidate['mail']}`} aria-describedby='mailHelpBlock' />
                          <small id='mailHelpBlock' className='form-text text-muted' /* style='color: red' */>
                            If you change your mail, you will receive a new confimation !
                          </small>
                        </div>
                      </div>

                      {/* <!--Second column--> */}
                      <div className='col-md-6'>
                        <div className='md-form'>
                          {/* <!-- <i className='fa fa-lock prefix'></i> --> */}
                          <Input name='login' onChange={this.onChange} value={login} icon='user' label='Your login' type='text' id='form82' className={`form-control validate ${formValidate['login']}`} aria-describedby='loginHelpBlock' />
                          <small id='loginHelpBlock' className='form-text text-muted' /* style='color: red' */>
                            Only letters, numbers and - _ . Must be between 2 and 36 characters
                          </small>
                        </div>
                      </div>
                    </div>
                    {/* <!-- Another row --> */}
                    <div className='row'>
                      {/* <!--First column--> */}
                      <div className='col-md-6'>
                        <div className='md-form'>
                          <Input onChange={this.onChange} value={phone} icon='phone' label='Phone number' name='phone' type='number' id='form6' className={`form-control validate ${formValidate['phone']}`} aria-describedby='phoneHelpBlock' />
                          <small id='phoneHelpBlock' className='form-text text-muted' /* style='color: red' */>
                            e.g: 0612345678; +33612345678; 33612345678
                          </small>
                        </div>
                      </div>

                      {/* <!--Second column--> */}
                      <div className='col-md-6'>
                        <div className='md-form'>
                          {/* <!-- <i className='fa fa-lock prefix'></i> --> */}
                          <Input onChange={this.onChange} value={activity} placeholder=' ' icon='briefcase' label='Activity' name='activity' type='text' id='form7' className={`form-control validate ${formValidate['activity']}`} />
                        </div>
                      </div>
                    </div>
                    <div className='row'>
                      <div className='col-md-6'>
                        <div className='md-form' /* style='border: 0' */>
                          {/* <Fa icon='calendar-alt' className='mr-1 fa-2x'/> */}
                          <div id='date'>
                            {/* <span id='spandate'>Birthdate:</span> */}
                            <Input onChange={this.onChange} value={birthdate ? birthdate : '1990-01-01'} icon='calendar-alt' label='Birthdate' className='active' name='birthdate' type='date' id='formdate' pattern='[0-9]{4}-[0-9]{2}-[0-9]{2}' aria-describedby='birthHelpBlock'/>
                            <small id='birthHelpBlock' className='form-text text-muted' /* style='color: red' */>
                              If your age is under 18, you will not apperead in searchs result
                            </small>
                          </div>
                        </div>
                      </div>
                      {/* <!--Second column--> */}
                      <div className='col-md-6'>
                        <div className='md-form'>
                        </div>
                      </div>
                    </div>
                    <div className='row'>
                      <div className='col-md-12'>
                        <div className='md-form'>
                          {/* <i className='fas fa-file-alt prefix' /> */}
                          <Input onChange={this.onChange} value={bio} icon='file-alt' label='Your bio' name='bio' type='textarea' id='form76' className='md-textarea' /* style='overflow: auto' */ />
                        </div>
                      </div>
                      </div>
                    {googleId.length === 0 ?
                    <div className='row'>
                      <div className='col-md-5 col-centered'>
                        <div className='md-form' /* style='min-width: 277px;' */>
                          <Input onChange={this.Checkpwd} value={passInfo} icon='lock' label='Fill the password' name='passInfo' type='password' id='form5' className={`form-control validate ${formValidate['passInfo']}`} aria-describedby='passwordHelpBlock'/>
                          <small id='passwordHelpBlock' className='form-text text-muted' /* style='color: red' */>
                            Please fill the password to apply changes or delete your account
                          </small>
                        </div>
                      </div>
                    </div>
                    : ''}
                    {(this.state.pwd === true || googleId.length > 0 ) && applyChanges === 6?
                    <div className='text-center mt-4 mb-2'>
                      <div id='buttonhover2' onClick={this.onSubmit}>
                        <Button color='primary' type='button' name='submit' value='account' id='disa2'>Apply changes
                        <Fa icon='pencil' className='ml-2' />
                        </Button>
                      </div>
                    </div> : '' }
                    {this.state.pwd === true || googleId.length > 0 ?
                    <div className='text-center mt-4 mb-2'>
                      <div id='buttonhover4'>
                        <Button  color='red' name='submit' className='waves-effect waves-light' onClick={this.toggle} id='deleteAccount'>Delete account
                          <Fa icon='times' className='ml-2' />
                        </Button>
                      </div>
                    </div> : ''}
                  </form>
                </div>
              </div>
              : '' }
              {selected === 'pass' ?
              <div id='change-pass'>
                {/* <p className='h1 text-center mb-4 mt-4'>Password modification</p>
                <div className='hr'></div> */}
                <div className='change-form'>
                  <form id='form3' method='POST'>
                    <div className='row'>
                      {/* <!--First column--> */}
                      <div className='col-md-5 col-centered'>
                        <div className='md-form'>
                          <Input onChange={this.Checkpwd} icon='lock' label='Actual password' name='passchange' type='password' id='formp5' value={this.state.passchange} className={`form-control validate ${formValidate['passchange']}`} />
                        </div>
                      </div>
                    </div>
                    {/* <!-- Identity row --> */}
                    <div className='row'>
                      {/* <!--First column--> */}
                      <div className='col-md-6'>
                        <div className='md-form'>
                          <Input onChange={this.Checkpwd} icon='lock' label='New password' name='newpass' type='password' id='formp41' className={`form-control validate ${formValidate['newpass']}`} value={this.state.newpass} required onFocus={this.ShowInfo} onBlur={this.HideInfo} />
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
                        </div>
                      </div>
                      {/* <!--Second column--> */}
                      <div className='col-md-6'>
                        <div className='md-form'>
                          <Input onChange={this.Checkpwd} icon='lock' label='Confirm new password' name='newpassverif' type='password' id='formp51' className={`form-control validate ${formValidate['newpassverif']}`} value={this.state.newpassverif} />
                        </div>
                      </div>
                    </div>
                    {/* <!--/.Second row--> */}
                    {pwdconf ? <center><span>{pwdconf}</span></center> : ''}
                    <div className='text-center mt-4 mb-2'>
                      <div id='buttonhover'>
                      {this.state.pwdverif === true && this.state.newpass === this.state.newpassverif && this.state.newpass.length !== 0 && pwdClass['gen'] === '1px solid green' ?
                        <Button color='primary' name='submit' value='pass' form='form3' id='disa' onClick={this.ChangePwd}>Change password<i className='fas fa-pencil-alt ml-2'></i></Button> : '' }
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              : '' }
              {selected === 'match' ?
              <div className='Select-pic'>
                <div id='match' style={{width: '100%'}}>
                    <FolderList all={this.state.allMatchs} update={this.gotUpdate} changePage={this.changePage} setNotif={this.setNotif} />
                </div>
              </div>
              : ''}
              {selected === 'pic' ?
              <div className='Select-pic'>
                <div id='pic' style={{width: '100%'}}>
                  <div className='change-form'>
                  {allImg ?
                  this.state.upload ?
                  <DropZone max={this.state.uploadMax} init={this.initPic} setNotif={this.setNotif} />
                  : ''
                  : 
                  <CircularIndeterminate size={50} style={{textAlign: 'center'}} />
                  }
                  {allImg ?
                  ProfImgs !== '' ? <div className='allPics'> {ProfImgs} </div>: ''
                  : ''
                  }
                  </div>
                </div>
              </div>
              : ''}
              {selected === 'visit' ?
              <div className='Select-pic'>
                <div id='match' style={{width: '100%', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap'}}>
                 <div className='tableProf'>
                    <span style={{alignSelf: 'center'}}><h2>Visits :</h2></span>
                    <VisitTable rows={this.state.visitTable} changePage={this.changePage}/>
                  </div>
                 <div className='tableProf'>
                    <span style={{alignSelf: 'center'}}><h2>Likes :</h2></span>
                    <LikedTable rows={this.state.likeTable} changePage={this.changePage}/>
                  </div>
                </div>
              </div>
              : '' }
            </div>
          </div>
        </div>
      )
    }
    else {
      return (<div />)
    }
  }
}

export default ProfilPage
