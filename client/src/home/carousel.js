import React from 'react'
import axios from 'axios'
import MotionStack from 'react-motion-stack'
import ImgMediaCard from './homeCard'
import 'react-motion-stack/build/motion-stack.css'
import './card.css'
import * as Mdb from 'mdbreact'
import CircularIndeterminate from '../progress/progress'
 

class CarouselPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      res: null,
      curid: null,
      curlogin: null,
      curDir: null,
      socket: this.props.socket,
      modal: false,
    }
    CarouselPage.toggle = CarouselPage.toggle.bind(this)
    this.onBeforeSwipe = this.onBeforeSwipe.bind(this)
    this.onSwipeEnd = this.onSwipeEnd.bind(this)
    window.onkeyup = (e) => {
      if (e.keyCode === 37) {
        e.preventDefault()
        let btn = document.getElementById('dislikeBtn')
        btn.click()
      } else if (e.keyCode === 39) {
        e.preventDefault()
        let btn = document.getElementById('likeBtn')
        btn.click()
      }
    }
  }

  static toggle() {
    this.setState({ modal: !this.state.modal })
  }

  componentWillMount() {
    let login = localStorage.login
    axios.post('/getAll/users', {login})
      .then((result) => {
        let res = result.data
        this.setState({
          res: res
        })
      })
  }

  onBeforeSwipe = (swipe, direction, state) => {
    if (state.data[0]) {
      this.setState({
        curid: state.data[0].id,
        curlogin: state.data[0].login,
        curDir: direction
      }) 
      swipe()
    }
  }
 
  onSwipeEnd = ({ data }) => {
    if (data[0]) {
      if (data[0].id !== this.state.curid) {
        const {curid, curlogin, curDir, socket} = this.state
        let idMe = localStorage.id
        let id_user = curid
        let login_user = curlogin
        if (curDir === 'left') {
          axios.post('/Dislike', {idMe, id_user})
            .then((result) => {
            })
        } else if (curDir === 'right') {
          axios.post('/Like', {idMe, id_user})
          .then((result) => {
            socket.emit('SendNewNotif', { id_user, login_user })
            if (result.data === 'match') CarouselPage.toggle(false)
          })
        }
      }
    }
  }

  renderButtons(props) {
    return (
      <div className="btn-group">
        <Mdb.Media id='dislikeBtn' object className='btlike' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAATWSURBVGhD3Vpbb9xEGF0ED/DC5QXBM7cfwA/IE1BR1rtpE27J2iYRdygtL0VFpRISogJR0aQUIigSEoJSEJRwCQEh8YRUQgtVJSqgWa+zJEqbjZQN6SZVSIbvOF/i2Pt5ZXt3vase6Ugbz5lvztgz42/GSTULhc6em8ezudvtrHEniN+4xsXtCXvrwzcUMsZ2K6MfsjTj10JGn6e/VQDLVsYYIw5aaXPbePdj13GY1kClUlfkM7l7yPwxMr4kGA5JfQkx8ln9bsTk8MkAd7Kg6b/JxuriqXw6l+FmmgeMcxoSPwgGGkvNGC1uNW/jZhsLSzP7aAhcFBtuAtEW3TSTm68fqqPjKhrHR6TGkqCl6UOqu/tKthMPE11d19Bd+VJqIEnCg9VhXM22ogF3oR06sU54ifVkWjmcAqkZh9leOFCl/qogbUJb03W2WRtrS2xyq1NU0hBbmEj33sp2g0HC5r8n6qY+wnZl0FLXKVeUeWH/oKqM/a7Kw6PKfuBxUVOLEw89oea/+l5VTp52YkmaINIQ09i2F8hzoqQdU8/vU2plRa1j8fQfyt7eL2olQrt45izXJlCsqZ17Ra1EJKds3QsrbWyRKgSxNHiEHbhY+OlnVciaot5D0kDrR2ngPVkfQCSabN/FWhYrV5D4T/8utbq4xBZczB0bFvWbOffpMKtdIFaxb6eoD6RmHGX7a6AJfn2cVPz8K296hpeD1VU1c+AdUQ+iDBoPKAZiSfpapOFV+WtLz7XcDXpvaHqXJAzD2Xc/ZDcuVpeX1fTe/VVaXEOZH7Nvf1ClDUtP2k/D6pAkCsv5kR/ZkouVixU1+eTuDc3kU7uda36g7uZYUUkr7QB3wxlaY5IoNDsfUZUTp9iai+WpaVXMPeMQv/1AHdQVY4alZpzgbjh5Va09dija9z+qLo0X2KKLpT/POfTj0t95p44UKyLLTiese42bhMJYLPbtUv+VZtlqMKCBVooRh+c6e29M5bW+O6TCuJzc8aI4F9bhzB3SSHXjEvlhCmdOUmE9nN73WvWyDNA1lEl16iH6kHxHXmpSRy6bodWyyW4+J8aIQ2eyA/RH2V8Ylc7yS0uqH0HLL641ZPnV9DmnE0AiL8QLJb7qouEvxKalKE+/sKEJmjvlL771xIpK8n6Qu0EdwVmuIApDJHx+JJk0enaKnMYvSsJajJPGl956n4WbQDHOv/yGqK9FHJJ40niAcvtPJHEQAzdWtGmS9Js599nXrHaBYVc0d4j6YOofs30X+NYhi2U2Y6s7c2BI1gfQTpt3sX0XOHygR3VSqiCx6vDhzNlohw+09HqWZYo1+eweUSsRKy1br0bU46CZ1w87Rznl4yNq4sGYx0HDo2vHQa8OiJpAZnP3sW0Z+MgiVmwnavo3bDcYOI7EaiAGaAPSovSvndVvYbu1QRt6QwrSFszqvWwzHHCELwZqIZGBsL3wuGw+9AD43EVBjvuDtoCfx/70tg7nyWj6kBA8EWI4xX4SEujRmsQFqbFmEKsTzdMebr6xwLJHwb+TGm4o6T0ReomtB0id8X1CNFEHEdPOmGluJjng+wQ9oaNkoCIZC0OnrmZ8JCaASQN7Apo/WZqYB4m/YB8tmXaIMtqeQosnW7WfaDfgZAP/GIMzJxC/N047Go5U6n/Iuyn9VPREpAAAAABJRU5ErkJggg==" href='#' onClick={props.reject}/>
        <Mdb.Media id='likeBtn' object className='btlike' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAT6SURBVGhD3ZpbbxNHFMddlYf2paUvVfvcCx+AD5CntqjgtQOJECTeXUDiTpGqwkMjeKAPqBUgcREioqmqliakammpeiGAoK3UKxREi0q5JOu1YzAC4sRxHDckmZ4zOSH25qw9vuzG6l/6SY535pz/eGZnZ2YT8ErRxpbne8ORl+2wsRDBz/gdXa5P2YtXPhMNGcuskH7I0oyL0ZCehr+FC0NWyLgAHLSC5tLe5rVPU5i5kQgEHusLRV4D85+C8RxjWBE9hzH6wvqrGJPC+yP8JaOafpk3VhWX+oKREKXxTjjOYUicYQzUFs3oiS82X6K0tZWlmathCIywiT0Ac8GPZlL66iUaGubBOO7gkvmBpentorn5cbJTmWJNTU/Cr3KSS+An6MFqMJ4gW+UJf4V6aMQ06KWinpnL4eSKZhwme2qCSmtmBakTbE3XyWZxTU2x/s1O5QJDLBMLtr5Idt0FBb1/TlSN/h3Z5QVTXSNfkcdetkYkd74nUp0nRPrbsyL9VY8Y6OgUiS1tbHkk8UabGPigS5bFOlg3ueNdGYsr7wYMMY1sFwrXOcrLjsZV4sHRY2I8NSTclLvRK5Jv735UJ9m2W37npvGBQfGg/SMZuyCXC7g4JeuFsoLGIq6Ck1jLRpG9/BelL6HJSZE69pkEP6soe+lPEVu5gc3tBBeaZH9GU6tYvsI02P2jV69RSu+EOZSGmmYcJ/tTght8vspSfLD7JKXyXqmuL1gP+cDwyt5Y1PIUNQOeG5rexBXMJ9a6SUxkRymN95oYycphzHnJp2DZD8PqEFcon3v7jlAK/3Rvz2HWSz4w0x6gZsihdYErlE/66zMU3j/hFM15KUAzfqNmyHVVsT22JPPDLxTeP2XO/8R6cTAkG2G9bjzHXJzF8OnvKbx/Sp86x3pxcqux9dlAn7Z6AXfRSepjeBb4rIEPu1kvTnB9GMAzJ+6ikzvbdlF4/3T7zZ2sFyfYBuWGRMOmeJhIUgrvNRZPyJysFweyIapDC7l/sIPSeK/7B95nPXDIoaV6s0tgQZf75yal8k65azeVewORNzsK/hhyXnSjf8N2+dT1Shi7f/12NjeLpg/KRqBUHoj53H1nn/JqtixNTIi7u/ayOV3JfyCqLFGcpD75nLLXTrjc53IVA7zvp2ZAQ/AslylUFBjDIz9fJAvVK/Pjr2XdF9MU7BRpGT/KFSyG3J9c+ZusVC6MUe5WF8FDkoJlPArW9t1c4VLEVqwvuoUtpdz1W8Jevo6NXRq9i+zPCN918IVLE49sFmOJO2RNXWN2XNblYqpgB81XyP6M8PABuuoProIK8VVbpTFV/WvFRNzcysZSAWdasj5b5R4HOcEdnco9g4cXOCS5GMqEI0vINi98ycJWVAWe/rjfFuPjZHtGk/AdTtuVzE4FaPo3ZNddeByJswEboAz6122Te5iHt5OS4Z7zon/tW2zZcoBJadgO6y+Q3eKCDb3BBakLwnor2VQTHuGzgeYQXIGQPXX9b170oPB1FwT50hl0DjhR8au3acme0fR2Jrgv4HCquCc4QdeaQIZL5gU4O8F92kLpayuc9iD4KS5xTYHnhPIUW41w6YzvJ1gTVYAx7ZAZpDT+Cd9PQA8dBwNZzpgKsq5mdLILQL+FewK4f8JwY+4Hfsd9NGdagtdge4plsWdn7SfqTXiygf8Yg2dOCH5+dNpRcwUC/wFEDPCGA8JYGAAAAABJRU5ErkJggg==" href='#' onClick={props.accept} />
      </div>
    )
  }
 
  render() {
    const {res} = this.state
    let data = null
    if (res !== null) {
      data = Array.from({ length: res.length - 1 }, (_, i) => ({
        id: res[i].uid,
        login: res[i].login,
        element: (
          <ImgMediaCard image={res[i].profimg} all={res[i]}/>
        )
      }))
    }
    return (
      <div>
        <Mdb.Modal color="success" isOpen={this.state.modal} toggle={this.toggle} side position="top-right">
          <Mdb.CardImage src="http://www.jtwo.tv/wp-content/uploads/2017/06/Tinder-its-a-match-typography-aiga.png" style={{ width: '500px' }}/>
          <Mdb.ModalFooter>
            <Mdb.Button color="success" onClick={CarouselPage.toggle}>Close</Mdb.Button>{' '}
          </Mdb.ModalFooter>
        </Mdb.Modal>
        <div className="demo-wrapper mt-2">
          {data !== null && data !== 0 ?
          <MotionStack
            infinite={false}
            data={data}
            onSwipeEnd={this.onSwipeEnd}
            onBeforeSwipe={this.onBeforeSwipe}
            render={props => props.element}
            renderButtons={this.renderButtons}
          /> : <CircularIndeterminate size={120} /> }
        </div>
      </div>
    )
  }
}

export default CarouselPage
