import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
// eslint-disable-next-line
import AddIcon from '@material-ui/icons/Add'
import Icon from '@material-ui/core/Icon'
// eslint-disable-next-line
import DeleteIcon from '@material-ui/icons/Delete'
// eslint-disable-next-line
import NavigationIcon from '@material-ui/icons/Navigation'

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  extendedIcon: {
    marginRight: theme.spacing.unit
  }
})

function LocaButton (props) {
  const { classes } = props
  return (
    <div>
      {/* <Button variant='fab' color='primary' aria-label='add' className={classes.button}>
        <AddIcon />
      </Button>
      <Button variant='fab' color='secondary' aria-label='edit' className={classes.button}>
        <Icon>edit_icon</Icon>
      </Button> */}
      <Button onClick={props.loca} id='locaBut' style={{outline: 'none', textDecoration: 'none', position: 'absolute', right: '0', top: '0', margin: '0', height: '38px', width: '38px'}} variant='fab' aria-label='delete' className={classes.button}>
        <Icon>navigation_icon</Icon>
      </Button>
      {/* <Button variant='fab' disabled aria-label='delete' className={classes.button}>
        <DeleteIcon />
      </Button> */}
    </div>
  )
}

LocaButton.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(LocaButton)
