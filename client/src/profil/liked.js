import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: '#66c5f1',
    color: theme.palette.common.white
  },
  body: {
    fontSize: 14
  }
}))(TableCell)

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    overflowX: 'auto'
  },
  table: {
    minWidth: 370
  },
  row: {
    cursor: 'pointer',
    '&:nth-of-type(odd)': {
      backgroundColor: '#a1a2a3'
    }
  }
})

function LikedTable (props) {
  const { classes, rows } = props
  if (rows) {
    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>Login</CustomTableCell>
              <CustomTableCell numeric>Date of like</CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => {
              return (
                <TableRow hover className={classes.row} key={row.id} onClick={e => props.changePage(e, '/user?' + row.name)}>
                  <CustomTableCell component='th' scope='row'>
                    <span>{row.name}</span>
                  </CustomTableCell>
                  <CustomTableCell numeric>{row.date}</CustomTableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>
    )
  } else {
    return (<div />)
  }
}

LikedTable.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(LikedTable)
