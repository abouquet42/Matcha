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
    // flex: '1',
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

function VisitTable (props) {
  const { classes, rows } = props
  if (rows) {
    let all = rows.map((row, key) =>
      <tr className={'MuiTableRow-root-81 MuiTableRow-hover-83 VisitTable-row-51 ' + classes.row} key={key} onClick={e => props.changePage(e, '/user?' + row.name)}>
        <CustomTableCell component='th' scope='row'>
          {row.name}
        </CustomTableCell>
        <CustomTableCell numeric>{row.number}</CustomTableCell>
        <CustomTableCell numeric>{row.last}</CustomTableCell>
      </tr>
    )
    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>Login</CustomTableCell>
              <CustomTableCell numeric>Number of visit</CustomTableCell>
              <CustomTableCell numeric>Last visit</CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {all}
          </TableBody>
        </Table>
      </Paper>
    )
  } else {
    return (<div />)
  }
}

VisitTable.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(VisitTable)
