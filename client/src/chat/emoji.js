import React from 'react'
import EmojiPicker from 'emoji-picker-react'
// import 'emoji-picker-react/dist/universal/style.scss'

class Emoji extends React.Component {
  render () {
    return (
      <EmojiPicker onEmojiClick={this.props.handle} />
    )
  }
}

export default Emoji
