import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
// eslint-disable-next-line
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
})

class GenSelector extends React.Component {
    state = {
    genre: ''
  }
  render() {
    const { classes } = this.props
    return (
      <form style={{width: '100%'}} className={classes.root} autoComplete="off">
        <FormControl style={{width: '100%'}} className={classes.formControl}>
          <InputLabel htmlFor="genre-helper">genre</InputLabel>
          <Select
            style={{width: '100%'}}
            value={this.props.value}
            onChange={this.props.onChange}
            input={<Input style={{width: '100%'}} name="genre" id="genre-helper" />}
          >
            <MenuItem value='Man'>Man</MenuItem>
            <MenuItem value='Woman'>Woman</MenuItem>
            {/* <MenuItem value='Other'>Other</MenuItem> */}
          </Select>
        </FormControl>
      </form>
    )
  }
}

GenSelector.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(GenSelector)
