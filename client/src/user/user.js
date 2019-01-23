import React from 'react'
import * as Mdb from 'mdbreact'
import axios from 'axios'
import StarRatings from 'react-star-ratings'
import { Fa } from 'mdbreact'
import { WithContext as ReactTags } from 'react-tag-input'
import '../profil/profil.css'

class UserProfil extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null,
      tags: [],
      modal: false,
      imgs: ''
    }
    this.socket = this.props.socket
    UserProfil.toggle = UserProfil.toggle.bind(this)
  }
  componentWillMount = () => {
    let visitor = null
    let id_user = null
    let date = new Date()
    if (localStorage.getItem('login')) visitor = localStorage.login
    if (this.props.location.search.length > 0) {
      let sel = this.props.location.search.slice(1, this.props.location.search.length)
      if (sel === localStorage.login)
        window.location = '/profil'
      axios.post('/getImgs', { login: sel })
        .then((result) => {
            this.setState({
              imgs: result.data
            })
        })
      axios.post('/Check/User', {user: sel, visitor, date: date})
        .then((result) => {
          if (result.data === false) window.location = '/'
          else {
            let login_user = sel
            id_user = result.data.id
            if (result.data.tags) {
              var obj = JSON.parse(result.data.tags)
              this.setState({ tags: obj })
            }
            this.socket.emit('SendNewNotif', { id_user, login_user })
            this.setState({
              user: result.data
            })
          }
        })
    }
    else {
      window.location = '/'
    }
  }
  static toggle() {
    this.setState({ modal: !this.state.modal })
  }
  onClickDislike = (e) => {
    const id_user = e.uid
    const idMe = localStorage.id
    axios.post('/Dislike', { id_user, idMe })
      .then((result) => {
        if (result.data === 'Dislike') this.setState({ user: { ...this.state.user, LikedOrNot: 'AlreadyDislike' } })
      })
  }
  onClickLike = (e) => {
    const id_user = e.uid
    const login_user = e.login
    const idMe = localStorage.id
    axios.post('/Like', { id_user, idMe, login_user })
      .then((result) => {
        this.socket.emit('SendNewNotif', { id_user, login_user })
        if (result.data === 'match') this.setState ({ user: {...this.state.user, LikedOrNot: 'matched'}})
        else if (result.data === 'Like') this.setState({ user: { ...this.state.user, LikedOrNot: 'AlreadyLike' } })
      })
  }
  onClickBlock = (e) => {
    let element = e.uid
    let login = localStorage.login
    axios.post('/unMatch', { element, login })
      .then((result) => {
        if (result.data !== '') {
          let login_user = result.data
          this.socket.emit('SendNewNotif', { element, login_user })
          this.setState({ user: { ...this.state.user, LikedOrNot: 'block' } })
        }
      })
  }
  onClickReport = (e) => {
    let element = e.uid
    let login = localStorage.login
    axios.post('/report', { element, login })
      .then((result) => {
        this.setState({ user: { ...this.state.user, LikedOrNot: 'Reported' } })
      })
  }

  render () {
    let {user} = this.state
    let tags = this.state.tags
    let imgs = this.state.imgs
    let images1 = ''
    let images2 = ''
    let images3 = ''
    let images4 = ''
    let images5 = ''
    if (user) {
      let { login, genre, first_name, last_name, birthdate, phone, popu, activity, bio, profimg, orientation, status, dateDeco, LikedOrNot, dist } = user
      let gender = ''
      if (genre === 'Man') gender = <i className='fas fa-mars' style={{ color: 'blue' }} />
      else gender = <i className='fas fa-venus' style={{ color: 'pink' }} />
      if (imgs[0]) images1 = <Mdb.CardImage src={imgs[0].data} /> 
      else imgs = 'no'
      if (imgs[1]) images2 = <Mdb.CardImage src={imgs[1].data} style={{ marginBottom: '10px' }}/>
      if (imgs[2]) images3 = <Mdb.CardImage src={imgs[2].data} style={{ marginBottom: '10px' }}/>
      if (imgs[3]) images4 = <Mdb.CardImage src={imgs[3].data} style={{ marginBottom: '10px' }}/>
      if (imgs[4]) images5 = <Mdb.CardImage src={imgs[4].data} style={{ marginBottom: '10px' }}/>
      return (
        <div>
          <Mdb.Modal isOpen={this.state.modal} toggle={this.toggle} onClick={UserProfil.toggle}>
            {images5}
            {images4}
            {images3}
            {images2}
            {images1}
            {imgs === 'no' ? <Mdb.CardImage src={profimg} style={{ marginBottom: '40px' }}/> : ''}
          </Mdb.Modal>
        <div id='content-prof'>
          <div id='profil-content'>
            <div className='main-info'>
              <p className='fa-2x ml-4 mb-4 mt-4'>Account</p>
            </div>
            <div className='mainProf'>
              <div className='pic-content p-2' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', maxWidth: '18%' }}>
                <div id='prof-img'>
                  <img src={profimg} alt='' id='imgmaggle' onClick={UserProfil.toggle}/>
                </div>
                <span style={{ whiteSpace: 'wrap' }}>{status ? <font color='green'><b>Online</b></font> : <center><font color='red'>Last connection<br/><b>{dateDeco}</b></font></center>}</span><br/>
                {LikedOrNot === 'liked' || LikedOrNot === 'Nothing' ?
                <div>
                  <Mdb.Media object className='btlike' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAATWSURBVGhD3Vpbb9xEGF0ED/DC5QXBM7cfwA/IE1BR1rtpE27J2iYRdygtL0VFpRISogJR0aQUIigSEoJSEJRwCQEh8YRUQgtVJSqgWa+zJEqbjZQN6SZVSIbvOF/i2Pt5ZXt3vase6Ugbz5lvztgz42/GSTULhc6em8ezudvtrHEniN+4xsXtCXvrwzcUMsZ2K6MfsjTj10JGn6e/VQDLVsYYIw5aaXPbePdj13GY1kClUlfkM7l7yPwxMr4kGA5JfQkx8ln9bsTk8MkAd7Kg6b/JxuriqXw6l+FmmgeMcxoSPwgGGkvNGC1uNW/jZhsLSzP7aAhcFBtuAtEW3TSTm68fqqPjKhrHR6TGkqCl6UOqu/tKthMPE11d19Bd+VJqIEnCg9VhXM22ogF3oR06sU54ifVkWjmcAqkZh9leOFCl/qogbUJb03W2WRtrS2xyq1NU0hBbmEj33sp2g0HC5r8n6qY+wnZl0FLXKVeUeWH/oKqM/a7Kw6PKfuBxUVOLEw89oea/+l5VTp52YkmaINIQ09i2F8hzoqQdU8/vU2plRa1j8fQfyt7eL2olQrt45izXJlCsqZ17Ra1EJKds3QsrbWyRKgSxNHiEHbhY+OlnVciaot5D0kDrR2ngPVkfQCSabN/FWhYrV5D4T/8utbq4xBZczB0bFvWbOffpMKtdIFaxb6eoD6RmHGX7a6AJfn2cVPz8K296hpeD1VU1c+AdUQ+iDBoPKAZiSfpapOFV+WtLz7XcDXpvaHqXJAzD2Xc/ZDcuVpeX1fTe/VVaXEOZH7Nvf1ClDUtP2k/D6pAkCsv5kR/ZkouVixU1+eTuDc3kU7uda36g7uZYUUkr7QB3wxlaY5IoNDsfUZUTp9iai+WpaVXMPeMQv/1AHdQVY4alZpzgbjh5Va09dija9z+qLo0X2KKLpT/POfTj0t95p44UKyLLTiese42bhMJYLPbtUv+VZtlqMKCBVooRh+c6e29M5bW+O6TCuJzc8aI4F9bhzB3SSHXjEvlhCmdOUmE9nN73WvWyDNA1lEl16iH6kHxHXmpSRy6bodWyyW4+J8aIQ2eyA/RH2V8Ylc7yS0uqH0HLL641ZPnV9DmnE0AiL8QLJb7qouEvxKalKE+/sKEJmjvlL771xIpK8n6Qu0EdwVmuIApDJHx+JJk0enaKnMYvSsJajJPGl956n4WbQDHOv/yGqK9FHJJ40niAcvtPJHEQAzdWtGmS9Js599nXrHaBYVc0d4j6YOofs30X+NYhi2U2Y6s7c2BI1gfQTpt3sX0XOHygR3VSqiCx6vDhzNlohw+09HqWZYo1+eweUSsRKy1br0bU46CZ1w87Rznl4yNq4sGYx0HDo2vHQa8OiJpAZnP3sW0Z+MgiVmwnavo3bDcYOI7EaiAGaAPSovSvndVvYbu1QRt6QwrSFszqvWwzHHCELwZqIZGBsL3wuGw+9AD43EVBjvuDtoCfx/70tg7nyWj6kBA8EWI4xX4SEujRmsQFqbFmEKsTzdMebr6xwLJHwb+TGm4o6T0ReomtB0id8X1CNFEHEdPOmGluJjng+wQ9oaNkoCIZC0OnrmZ8JCaASQN7Apo/WZqYB4m/YB8tmXaIMtqeQosnW7WfaDfgZAP/GIMzJxC/N047Go5U6n/Iuyn9VPREpAAAAABJRU5ErkJggg==" href='#' onClick={this.onClickDislike.bind(this, user)}/>
                  <Mdb.Media object className='btlike' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAT6SURBVGhD3ZpbbxNHFMddlYf2paUvVfvcCx+AD5CntqjgtQOJECTeXUDiTpGqwkMjeKAPqBUgcREioqmqliakammpeiGAoK3UKxREi0q5JOu1YzAC4sRxHDckmZ4zOSH25qw9vuzG6l/6SY535pz/eGZnZ2YT8ErRxpbne8ORl+2wsRDBz/gdXa5P2YtXPhMNGcuskH7I0oyL0ZCehr+FC0NWyLgAHLSC5tLe5rVPU5i5kQgEHusLRV4D85+C8RxjWBE9hzH6wvqrGJPC+yP8JaOafpk3VhWX+oKREKXxTjjOYUicYQzUFs3oiS82X6K0tZWlmathCIywiT0Ac8GPZlL66iUaGubBOO7gkvmBpentorn5cbJTmWJNTU/Cr3KSS+An6MFqMJ4gW+UJf4V6aMQ06KWinpnL4eSKZhwme2qCSmtmBakTbE3XyWZxTU2x/s1O5QJDLBMLtr5Idt0FBb1/TlSN/h3Z5QVTXSNfkcdetkYkd74nUp0nRPrbsyL9VY8Y6OgUiS1tbHkk8UabGPigS5bFOlg3ueNdGYsr7wYMMY1sFwrXOcrLjsZV4sHRY2I8NSTclLvRK5Jv735UJ9m2W37npvGBQfGg/SMZuyCXC7g4JeuFsoLGIq6Ck1jLRpG9/BelL6HJSZE69pkEP6soe+lPEVu5gc3tBBeaZH9GU6tYvsI02P2jV69RSu+EOZSGmmYcJ/tTght8vspSfLD7JKXyXqmuL1gP+cDwyt5Y1PIUNQOeG5rexBXMJ9a6SUxkRymN95oYycphzHnJp2DZD8PqEFcon3v7jlAK/3Rvz2HWSz4w0x6gZsihdYErlE/66zMU3j/hFM15KUAzfqNmyHVVsT22JPPDLxTeP2XO/8R6cTAkG2G9bjzHXJzF8OnvKbx/Sp86x3pxcqux9dlAn7Z6AXfRSepjeBb4rIEPu1kvTnB9GMAzJ+6ikzvbdlF4/3T7zZ2sFyfYBuWGRMOmeJhIUgrvNRZPyJysFweyIapDC7l/sIPSeK/7B95nPXDIoaV6s0tgQZf75yal8k65azeVewORNzsK/hhyXnSjf8N2+dT1Shi7f/12NjeLpg/KRqBUHoj53H1nn/JqtixNTIi7u/ayOV3JfyCqLFGcpD75nLLXTrjc53IVA7zvp2ZAQ/AslylUFBjDIz9fJAvVK/Pjr2XdF9MU7BRpGT/KFSyG3J9c+ZusVC6MUe5WF8FDkoJlPArW9t1c4VLEVqwvuoUtpdz1W8Jevo6NXRq9i+zPCN918IVLE49sFmOJO2RNXWN2XNblYqpgB81XyP6M8PABuuoProIK8VVbpTFV/WvFRNzcysZSAWdasj5b5R4HOcEdnco9g4cXOCS5GMqEI0vINi98ycJWVAWe/rjfFuPjZHtGk/AdTtuVzE4FaPo3ZNddeByJswEboAz6122Te5iHt5OS4Z7zon/tW2zZcoBJadgO6y+Q3eKCDb3BBakLwnor2VQTHuGzgeYQXIGQPXX9b170oPB1FwT50hl0DjhR8au3acme0fR2Jrgv4HCquCc4QdeaQIZL5gU4O8F92kLpayuc9iD4KS5xTYHnhPIUW41w6YzvJ1gTVYAx7ZAZpDT+Cd9PQA8dBwNZzpgKsq5mdLILQL+FewK4f8JwY+4Hfsd9NGdagtdge4plsWdn7SfqTXiygf8Yg2dOCH5+dNpRcwUC/wFEDPCGA8JYGAAAAABJRU5ErkJggg==" href='#' onClick={this.onClickLike.bind(this, user)}/>
                </div>
                  : LikedOrNot === 'matched' ? <div><center><p style={{ color: 'green', fontSize: '24px' }}><b>Match</b></p><Mdb.Button color='danger' onClick={this.onClickBlock.bind(this, user)}>Block</Mdb.Button></center></div>
                  : LikedOrNot === 'AlreadyDislike' ? <p style={{ color: 'red', fontSize: '15px' }}><b>Already Disliked</b></p>
                  : LikedOrNot === 'AlreadyLike' ? <div><center><p style={{ color: 'green', fontSize: '15px' }}><b>Already liked</b></p> <Mdb.Button color='danger' onClick={this.onClickBlock.bind(this, user)}>Block</Mdb.Button></center></div> : <p style={{ color: 'red', fontSize: '15px' }}><b>Blocked</b></p>
                }
                {LikedOrNot !== 'Reported' ? <div><center><Mdb.Button color='danger' onClick={this.onClickReport.bind(this, user)}>Report</Mdb.Button></center></div> : <p style={{ color: 'red', fontSize: '20px' }}><b>Reported</b></p> }
              </div>
              <div className='NameProf m-2'>
                <div className='nameStar'>
                  <span className='mb-2 h4'>{first_name}</span>
                  <StarRatings
                    rating={popu}
                    starRatedColor="orange"
                    starDimension="20px"
                    starSpacing="4px"
                    numberOfStars={5}
                    name='rating'
                  />
                </div>
                <div className='mainProf'>
                  <div className='info-content  p-2'>
                    <div className='info-main'>
                      <span>Infos</span>
                    </div>
                      <div className='ml-4 mt-3'>
                        <span className='mt-1' style={{ display: 'flex', alignItems: 'center' }}><i style={{ marginLeft: '-5px' }} className="mt-1 icon-test mr-2 fas fa-transgender-alt"></i><b>Orientation:</b> {orientation}</span>
                        <span className='mt-1' style={{ display: 'flex', alignItems: 'center' }}><Fa icon='map-marker' className='mr-2 icon-test' /> {dist} kms</span>
                      </div>
                  </div>
                  <div className='int-content  p-2'>
                    <div className='info-main'>
                      <span>Interests</span>
                    </div><br />
                      <ReactTags inline tags={tags}
                        style={{ zIndex: '10000' }}
                        readOnly={true}
                        classNames={{
                          tags: 'tagsClass',
                          selected: 'selectedClass',
                          tag: 'tagClass',
                        }}
                      />
                  </div>
                </div>
              </div>
            </div>
            <div id='profil-info'>
              <div className='change-form'>
                  {/* <!-- Identity row --> */}
                  <div className='row' id='name-change'>
                    {/* <!--First column--> */}
                    <div className='col-md-4'>
                      <div className='md-form'>
                        <span><b>Genre:</b> {gender}  {genre}</span>
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div className='md-form'>
                        <span><b>First name:</b> {first_name}</span>
                      </div>
                    </div>

                    {/* <!--Second column--> */}
                    <div className='col-md-4'>
                      <div className='md-form'>
                        <span><b>Last name:</b> {last_name}</span>
                      </div>
                    </div>
                  </div>
                  {/* <!-- Another row --> */}
                  <div className='row'>
                    <div className='col-md-4'>
                      <div className='md-form'>
                        <span><b>Login:</b> {login}</span>
                      </div>
                    </div>
                    {/* <!--First column--> */}
                    <div className='col-md-4'>
                      <div className='md-form'>
                        <span><b>Phone:</b> {phone}</span>
                      </div>
                    </div>

                    {/* <!--Second column--> */}
                    <div className='col-md-4'>
                      <div className='md-form'>
                        <span><b>Activity:</b> {activity ? activity : 'None'}</span>
                      </div>
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-md-6'>
                      <div className='md-form' /* style='border: 0' */>
                        <span><b>Birthdate:</b> {birthdate}</span>
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
                        <span><b>Bio:</b> {bio}</span>
                      </div>
                    </div>
                  </div>
              </div>
            </div>          
          </div>
        </div>
        </div>
      )
    } else 
      return (<div />)
  }
}

export default UserProfil
