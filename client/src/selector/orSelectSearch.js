import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2
  }
})

class SelectSearch extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      filtre: ''
    }
  }
  render () {
    const { classes } = this.props
    return (
      <form style={{width: '100%'}} className={classes.root} autoComplete='off'>
        <FormControl style={{width: '100%'}} className={classes.formControl}>
          <InputLabel htmlFor='filtre-helper'>Filtre</InputLabel>
          <Select
            style={{width: '100%'}}
            value={this.props.value}
            onChange={this.props.onChange}
            input={<Input style={{width: '100%'}} name='filtre' id='filtre-helper' />}
          >
            <MenuItem selected value=''>Default</MenuItem>
            <MenuItem value=' ORDER BY users.birthdate DESC'>Âge croissant</MenuItem>
            <MenuItem value=' ORDER BY users.birthdate ASC'>Âge décroissant</MenuItem>
            <MenuItem value='locaAsc'>Localisation croissante</MenuItem>
            <MenuItem value='locaDesc'>Localisation décroissante</MenuItem>
            <MenuItem value=' ORDER BY `profil_user`.`popu` ASC'>Popularité croissante</MenuItem>
            <MenuItem value=' ORDER BY `profil_user`.`popu` DESC'>Popularité décroissante</MenuItem>
          </Select>
        </FormControl>
      </form>
    )
  }
}

SelectSearch.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(SelectSearch)
