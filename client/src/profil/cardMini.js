import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

const styles = {
  card: {
    maxWidth: 345
  },
  media: {
    height: 0,
    paddingTop: '56.25%'// 16:9
  }
}

function MiniProfil (props) {
  const { classes, all, selected } = props
  if (all && selected) {
    let current = null
    Object.keys(all).map((val, key) => {
      if (all[val]['id'] === selected) {
        current = all[val]
      }
      return null
    })
    return (
      <div style={{flex: '1'}}>
        {current !== null ? <Card className={classes.card}>
          <CardMedia
            className={classes.media}
            image={current['profimg']}
            title='Contemplative Reptile'
          />
          <CardContent>
            <Typography gutterBottom variant='headline' component='h2'>
              {current !== null ? current['login'] : ''}
            </Typography>
            <Typography component='p'>
              {current['bio']}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size='small' color='primary' onClick={e => props.changePage(e, '/user?' + current['login'])}>
              Full profil
            </Button>
          </CardActions>
        </Card> : ''}
      </div>
    )
  } else {
    return (<div />)
  }
}

MiniProfil.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(MiniProfil)
