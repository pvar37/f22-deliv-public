import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import EntryModal from './EntryModal';
import { getCategory } from '../utils/categories';
// Imported packages for additional functionality
import * as React from 'react';
import { hitEntry } from '../utils/mutations';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';

// Table component that displays entries on home screen
// Entirely replaced to allow for tabulating hits and sorting table

// Sorting functionality from MUI at https://mui.com/material-ui/react-table/
// Figures out order of two elements within column
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// Order according to ascending or descending
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Sorts entire table by column
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// Headers corresponding to entry attributes
// User eliminated since functionality currently only allows for entries from the logged-in user
const headCells = [
  {
    id: 'name',
    numeric: false,
    label: 'Name',
    sortable: true
  },
  {
    id: 'link',
    numeric: false,
    label: 'Link',
  },
  {
    id: 'category',
    numeric: false,
    label: 'Category',
    // Categories were stored as integers, so sort order would be incorrect.
    sortable: false
  },
  {
    id: 'hits',
    numeric: true,
    label: 'Hits',
    sortable: true
  },
  {
   id: 'open',
   numeric: true,
   label: 'Open',
 },
];

// Table heading with sort icon according to whether table is being sorted by a certain column ascending or descending
function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.id === 'name' ? 'left' : 'right'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={headCell.sortable ? createSortHandler(headCell.id) : null}
              hideSortIcon={!headCell.sortable}
              sx={{color: 'black',
              '&:hover': {
               color: 'black'
              },
              '&:focus': {
               color: 'black'
              }}}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

// Table with enhanced header
export default function EnhancedTable({ entries }) {
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('hits');

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={entries.length}
            />
            <TableBody>
              {stableSort(entries, getComparator(order, orderBy))
                .map((entry, user) => {
                  // Essentially same as editing entry, but only adding to hit count
                  const handleHit = () => {
                     const newEntry = {
                        name: entry.name,
                        link: entry.link,
                        description: entry.description,
                        user: user?.displayName ? user?.displayName : "GenericUser",
                        category: entry.category,
                        hits: entry.hits,
                        userid: user?.uid,
                     };
                     hitEntry(newEntry, entry).catch(console.error);
                  };

                  return (
                    <TableRow
                      tabIndex={-1}
                      key={entry.id}
                    >
                      <TableCell component="th" scope="row">
                        {entry.name}
                     </TableCell>
                     {/* Add 1 to number of hits every time link is clicked 
                        Automatically add "https://" to links that do not have it and open links in new tab*/}
                     <TableCell align="right"><Link href={entry.link.startsWith('https://') ? entry.link : 'https://' + entry.link} onClick={handleHit} target="_blank">{entry.link}</Link></TableCell>
                     <TableCell align="right">{getCategory(entry.category).name}</TableCell>
                     <TableCell align="right">{entry.hits}</TableCell>
                     <TableCell sx={{ "padding-top": 0, "padding-bottom": 0 }} align="right">
                        <EntryModal entry={entry} type="edit" />
                     </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
