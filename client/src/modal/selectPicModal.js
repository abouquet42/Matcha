import React from 'react';
import { Fa, Container, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'mdbreact'
import axios from 'axios'
import CircularIndeterminate from '../progress/progress'


class ModalPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      modal4: false,
      allImg: null,
      current: '',
      dataUrl: null
    }

    this.toggle4 = this.toggle4.bind(this)
    this.initPic = this.initPic.bind(this)
  }

  toggle4 () {
    if (!this.state.modal4)
      this.initPic()
    this.setState({
      modal4: !this.state.modal4,
      allImg: null,
      upload: false
    })
  }

  componentWillMount = (e) => {
    let login = localStorage.getItem('login')
    axios.post('/getCurrentProf', {login})
      .then((result) => {
        this.setState({
          current: result.data
        })
      })
  }
  
  initPic = (e) => {
    let login = localStorage.getItem('login')
    axios.post('getImgs', {login})
    .then((result) => {
      if (result.data === 'no') {
        this.setState({
          upload: true,
          uploadMax: 5,
          allImg: true,
          selected: null
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
            if (result.data[key]['id'] === this.state.current) {
              this.setState({
                selected: result.data[key]['id'].toString()
              })
            }
          }
          return all
        })
        this.setState({
          allImg: all ? all : null
        })
        }
      })
  }

  SelectPic = (e) => {
    this.setState({
      selected: e.target.id
    })
  }

  updateImg = (e) => {
    let login = localStorage.getItem('login')
    if (this.state.selected === 'new') {
      let output = document.getElementById('imgmaggle')
      let dataURL = document.getElementById('new').src
      let lastoutput = output.src
      output.src = dataURL
      axios.post('/update/img', {dataURL, login})
        .then((result) => {
          if (result.data === 'An error occured, please try again !') {
            output.src = lastoutput
          } else {
            this.setState({
              selected: result.data.toString(),
              current: result.data.toString()
            })
          }
        })
    } else {
      let id = this.state.selected
      axios.post('update/profImg', {id, login})
        .then((result) => {
          let output = document.getElementById('imgmaggle')
          let lastoutput = output.src
          if (result.data !== 'An error occured, please try again !') {
            output.src = result.data['data']
            this.setState({
              selected: result.data['id'].toString(),
              current: result.data['id'].toString()
            })
          } else {
            output.src = lastoutput
          }
        })
      }
    this.props.setNotif('Profil picture changed !', 'success')
    this.toggle4()
  }

  SelectImg = (e) => {
    document.getElementById('upfile').click()
  }

  openFile = (e) => {
    e.preventDefault()
    let input = e.target
    let reader = new FileReader()
    reader.onload = (e) => {
      let output = document.getElementById('new')
      document.getElementById('new').style.display = 'inline-block'
      // let lastoutput = output.src
      let dataURL = reader.result
      output.src = dataURL
    }
    this.setState({
      selected: 'new'
    })
    reader.readAsDataURL(input.files[0])
  }

  render () {
    let {allImg} = this.state
    let ProfImgs = ''
    if (allImg) {
      ProfImgs = Object.keys(allImg).map((img, index) =>
      <div id={allImg[img].id} onClick={this.SelectPic} key={allImg[img].id} className='picsProf m-3' style={{position: 'relative', maxWidth: '180px', minWidth: '50px', cursor: 'pointer'}}>
        <img alt='pic' id={allImg[img].id} style={{width: '-webkit-fill-available'}} className={this.state.selected === allImg[img].id.toString() ? 'selected-pic' : ''} key={allImg[img].id} src={allImg[img].data} />
      </div>
      )
    }
    return (
      <Container>
        <div className='cam-icon' onClick={this.toggle4}>
          <Fa icon='camera' />
        </div>
        <Modal isOpen={this.state.modal4} toggle={this.toggle4} size='lg'>
          <ModalHeader toggle={this.toggle4}>Choose your profil picture</ModalHeader>
          <ModalBody>
            <div className='hr'> Choose in your pictures </div>
            {allImg ? ProfImgs !== '' ? <div className='allPics'> {ProfImgs} </div> : <CircularIndeterminate size={50} style={{textAlign: 'center'}} /> : <CircularIndeterminate size={50} style={{textAlign: 'center'}} />}
            {this.state.upload ?
            <div>
            <div className='hr'> Or upload a new picture </div>
              <img onClick={this.SelectPic} style={{width: '80px', display: 'none', cursor: 'pointer'}} className={this.state.selected === 'new' ? 'mr-2 selected-pic' : 'mr-2'} id='new' src='' alt='newprofimg' />
              <input type="file" id="" onChange={this.openFile} name="newpic" accept="image/*"/>
            </div>
            : ''
            }
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={this.toggle4}>Close</Button>{' '}
            <Button color='primary' onClick={this.updateImg}>Save changes</Button>
          </ModalFooter>
        </Modal>
      </Container>
    )
  }
}

export default ModalPage
