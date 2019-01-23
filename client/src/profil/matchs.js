import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import { lighten } from '@material-ui/core/styles/colorManipulator'
import MiniProfil from './cardMini'
import Axios from '../../node_modules/axios'
import io from 'socket.io-client'
const socket = io('https://localhost:3000', {
  trasnports: ['polling']
})

// let calcDist = async (mLoc, uLoc) => {
//   if (mLoc && uLoc) {
//     const response = await fetch('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=place_id:' + mLoc + '&destinations=place_id:' + uLoc + '&key=AIzaSyCKb5nHXbxWF6uj_Ehm-P65YZ95KqH8Tuw')
//     const body = await response.json()
//     if (response.status !== 200) throw Error(body.message)
//     return body
//   } else return '?'

// }
let createData = async (all) => {
  if (all) {
    // let data = []
    let ret = Object.keys(all).map( async (val, key) => {
      // let dist = await calcDist(all[val]['loc'], all[val]['myloca'])
      let id = all[val]['id']
      let login = all[val]['login']
      // let distances = dist === '?' ? '?' : dist.rows[0].elements[0].distance.text.split(' ')[1] === 'm' ? '1' : dist.rows[0].elements[0].distance.text.split(' ')[0]
      let distances = all[val]['dist']
      let popularity = Math.floor(all[val]['popu'] / 20)
      let date = all[val]['date']
      let age = all[val]['age']
      let data = {id: id, login, distances, popularity, date, age}
      return data
    })
    let res = await new Promise((resolve, reject) => {
      Promise.all(ret).then((completed) => resolve(completed))
    })
    return res
  }
}

function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
    : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
}

const columnData = [
  { id: 'login', numeric: false, disablePadding: false, label: 'Login' },
  { id: 'distances', numeric: true, disablePadding: false, label: 'Distances (Km)' },
  { id: 'popularity', numeric: true, disablePadding: false, label: 'Popularity (☆)' },
  { id: 'date', numeric: true, disablePadding: false, label: 'Days since match' },
  { id: 'age', numeric: true, disablePadding: false, label: 'Age' },
];

class EnhancedTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount } = this.props;
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {columnData.map(column => {
            return (
              <TableCell
                key={column.id}
                numeric={column.numeric}
                padding={column.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === column.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={order}
                    onClick={this.createSortHandler(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});

let handleDelete = (event, all, update) => {
  if (all.length >= 1) {
    let login = localStorage.getItem('login')
    let j = 0
    for (let i = 0; i < all.length; i++) {
      const element = all[i];
      Axios.post('/unMatch', {element, login})
        // eslint-disable-next-line
        .then((result) => {
          if (result.data !== '') {
            let login_user = result.data
            socket.emit('SendNewNotif', { element, login_user })
            j++
          }
          if (j === all.length) {
            update()
          }
        })
    }
  }
}

let EnhancedTableToolbar = props => {
  const { numSelected, classes, allSelected, update } = props;

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subheading">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant="title" id="tableTitle">
            Matchs
          </Typography>
        )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="Delete">
              <DeleteIcon onClick={event => handleDelete(event, allSelected, update)}/>
            </IconButton>
          </Tooltip>
        ) : ''
        }
      </div>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = theme => ({
  root: {
    width: '59%',
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    marginRight: '12%'
  },
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  mainDiv: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingRight: '30px',
    paddingLeft: '30px'
  }
});

class FolderList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: 'asc',
      orderBy: 'login',
      selected: [],
      miniProf: null,
      data: null,
      page: 0,
      rowsPerPage: 5,
      update: null
    }
  }

  updateThatShit = (e) => {
    this.setState({
      selected: []
    })
    this.props.update()
    this.props.setNotif('Match deleted !', 'success')
  }

  componentWillMount = async () => {
    this.setState({
      data: await createData(this.props.all)
    })
  }

  componentWillReceiveProps = async (nextProps) => {
    this.setState({
      data: await createData(nextProps.all)
    })
  }
  
  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState(state => ({ selected: state.data.map(n => n.id) }));
      return;
    }
    this.setState({ selected: [] });
  };

  handleMiniProf = (event, id) => {
    if (this.state.miniProf !== id && event.target.type !== 'checkbox')
      this.setState({
        miniProf: id
      })
  }
  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    this.setState({ selected: newSelected });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  render() {
    const { classes, all } = this.props
    const { data, order, orderBy, selected, rowsPerPage, page } = this.state
    if (this.props.all !== null && data) {
      const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
      return (
        <div className={classes.mainDiv}>
        <Paper className={classes.root}>
          <EnhancedTableToolbar numSelected={selected.length} allSelected={selected} update={this.updateThatShit} />
          <div className={classes.tableWrapper}>
            <Table className={classes.table} aria-labelledby="tableTitle">
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={this.handleSelectAllClick}
                onRequestSort={this.handleRequestSort}
                rowCount={data.length}
              />
              <TableBody>
                {data
                  .sort(getSorting(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(n => {
                    const isSelected = this.isSelected(n.id);
                    return (
                      <TableRow
                        hover
                        onClick={event => this.handleMiniProf(event, n.id)}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={-1}
                        key={n.id}
                        selected={isSelected}
                        style={this.state.miniProf === n.id ? {backgroundColor: 'aliceblue'} : {cursor: 'pointer'}}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isSelected} onClick={event => this.handleClick(event, n.id)} />
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {n.login}
                        </TableCell>
                        <TableCell numeric>{n.distances}</TableCell>
                        <TableCell numeric>{n.popularity}</TableCell>
                        <TableCell numeric>{n.date}</TableCell>
                        <TableCell numeric>{n.age}</TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 49 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            backIconButtonProps={{
              'aria-label': 'Previous Page',
            }}
            nextIconButtonProps={{
              'aria-label': 'Next Page',
            }}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
          />
        </Paper>
        <MiniProfil all={all} selected={this.state.miniProf} changePage={this.props.changePage}/>
        </div>
      );
    }
    else {
      return (
        <div className="mt-3 mb-3" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
          <h2>You have no match for the moment</h2>
        </div>
      )
    }
  }
}

FolderList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FolderList);
