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

class SimpleSelect extends React.Component {
    state = {
    orientation: ''
  }
  render() {
    const { classes } = this.props
    return (
      <form style={{width: '100%'}} className={classes.root} autoComplete="off">
        <FormControl style={{width: '100%'}} className={classes.formControl}>
          <InputLabel htmlFor="orientation-helper">Orientation</InputLabel>
          <Select
            style={{width: '100%'}}
            value={this.props.value}
            onChange={this.props.onChange}
            input={<Input style={{width: '100%'}} name="orientation" id="orientation-helper" />}
          >
            <MenuItem value='bi'>Bisexuel</MenuItem>
            <MenuItem value='hétéro'>Hétérosexuel</MenuItem>
            <MenuItem value='homo'>Homosexuel</MenuItem>
          </Select>
        </FormControl>
      </form>
    )
  }
}

SimpleSelect.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(SimpleSelect)
