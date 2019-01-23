import React from 'react'
import Slider, { Range } from 'rc-slider'
// import 'rc-slider/assets/index.css'

class IndexPage extends React.Component {
  constructor() {
    super()
    this.state = {
      value: {
      },
    }
  }  
  onChange = (value) => {
    this.setState({ value })
  }
  render () {
    const {value} = this.state
    return (
      <div>
        <Slider />
        <Range id='range' defaultValue={[10, 30, 40, 60]} onChange={this.onChange} min={0} max={100} pushable /* allowCross={false} */ count={3} />
        <span>{value[0]}</span>
      </div>
    )
  }
}

export default IndexPage
