import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import Radio from '@material-ui/core/Radio';

const styles = {
  root: {
    color: green[600],
    '&$checked': {
      color: green[500],
    },
  },
  checked: {},
  size: {
    width: 40,
    height: 40
  },
  sizeIcon: {
    fontSize: 20
  }
}

class RadioButton extends React.Component {
  render () {
    const { classes } = this.props
    return (
      <div>
        <Radio
          checked={this.props.selectedValue}
          onClick={this.props.change()}
          // value={this.props.id}
          id={this.props.id.toString()}
          name='radio-button-demo'
          aria-label='C'
          classes={{
            root: classes.root,
            checked: classes.checked
          }}
        />
      </div>
    )
  }
}

RadioButton.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(RadioButton)
