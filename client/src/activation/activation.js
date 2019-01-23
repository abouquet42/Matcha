import React from 'react'
import * as Mdb from 'mdbreact'
import axios from 'axios'

class ActivationPage extends React.Component {
  constructor () {
    super()
    this.state = {
      data: ''
    }
  }

  componentDidMount () {
    axios.get(window.location.pathname).then((result) => {
      if (result.data === 'VERIF') {
        setTimeout(() => {
          this.props.history.push('/')
        }, 5000)
        this.setState({
          data: 'This account has been validated! You gonna be redirect to the home page in 5 secondes'
        })
      } else {
        this.setState({
          data: 'An error appared, the account has not been activated or you already activated it!'
        })
      }
    })
  }

  render () {
    return (
      <div>
        <Mdb.Container>
          {this.state.data}
        </Mdb.Container>
      </div>
    )
  }
};

export default ActivationPage
