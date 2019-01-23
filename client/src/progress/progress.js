import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
// eslint-disable-next-line
import purple from '@material-ui/core/colors/purple'

const styles = theme => ({
  progress: {
    margin: theme.spacing.unit * 2
  }
})

function CircularIndeterminate (props) {
  // eslint-disable-next-line
  const { classes } = props
  return (
    <div style={props.style}>
      <CircularProgress /* className={classes.progress} */ size={props.size} />
    </div>
  )
}

CircularIndeterminate.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(CircularIndeterminate)
