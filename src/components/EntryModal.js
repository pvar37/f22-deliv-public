import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import { useState } from 'react';
import { categories } from '../utils/categories';
import { addEntry, updateEntry, deleteEntry } from '../utils/mutations';

// Modal component for individual entries.

/* EntryModal parameters:
entry: Data about the entry in question
type: Type of entry modal being opened. 
   This can be "add" (for adding a new entry) or 
   "edit" (for opening or editing an existing entry from table).
user: User making query (The current logged in user). */

export default function EntryModal({ entry, type, user }) {

   // State variables for modal status

   const [open, setOpen] = useState(false);
   // Current entry
   const [curEntry, setEntry] = useState(entry);
   const [name, setName] = useState(entry.name);
   const [link, setLink] = useState(entry.link);
   const [description, setDescription] = useState(entry.description);
   const [category, setCategory] = React.useState(entry.category);
   // Tracks number of times link was clicked
   const [hits, setHits] = useState(entry.hits)
   // Checks if entry is being edited
   const [editable, makeEditable] = useState(true);

   // Modal visibility handlers

   const handleClickOpen = () => {
      setOpen(true);
      setEntry(entry);
      setName(entry.name);
      setLink(entry.link);
      setDescription(entry.description);
      setCategory(entry.category);
      setHits(entry.hits)
      if(type === "edit") {makeEditable(false)};
   };

   const handleClose = () => {
      setOpen(false);
   };

   // Mutation handlers

   const handleAdd = () => {
      const newEntry = {
         name: name,
         link: link,
         description: description,
         user: user?.displayName ? user?.displayName : "GenericUser",
         category: category,
         hits: hits,
         userid: user?.uid,
      };

      addEntry(newEntry).catch(console.error);
      handleClose();
   };

   // Makes entry editable
   const handleChange = () => {
      makeEditable(true);
   }

   // Added edit mutation handler
   const handleEdit = () => {
      const newEntry = {
         name: name,
         link: link,
         description: description,
         user: user?.displayName ? user?.displayName : "GenericUser",
         category: category,
         hits: hits,
         userid: user?.uid,
      };
      updateEntry(newEntry, curEntry).catch(console.error);
      handleClose();
   };

   // Added delete mutation handler
   const handleDelete = () => {
      var result = window.confirm("Are you sure you want to delete?");
      if(result) {
         deleteEntry(curEntry).catch(console.error);
         handleClose();
      }
   };

   // Added delete color
   const theme = createTheme({
      palette: {
         delete: {
            main: '#ed6c02',
        },
      },
    });

   // Button handlers for modal opening and inside-modal actions.
   // These buttons are displayed conditionally based on if adding or editing/opening.

   const openButton =
      type === "edit" ? <IconButton onClick={handleClickOpen}>
         <OpenInNewIcon />
      </IconButton>
         : type === "add" ? <Button variant="contained" onClick={handleClickOpen}>
            Add entry
         </Button>
            : null;

   // Buttons for viewing vs. editing
   const actionButtons =
      type === "add" ?
            <DialogActions>
               <Button onClick={handleClose}>Cancel</Button>
               <Button variant="contained" onClick={handleAdd}>Add Entry</Button>
            </DialogActions>
            : type === "edit" ? (
               !editable ? <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <ThemeProvider theme={theme}><Button color="delete" onClick={handleDelete}>Delete</Button></ThemeProvider>
                  <Button variant="contained" onClick={handleChange}>Edit</Button>
               </DialogActions>
               : <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <ThemeProvider theme={theme}><Button color="delete" onClick={handleDelete}>Delete</Button></ThemeProvider>
                  <Button variant="contained" onClick={handleEdit}>Confirm</Button>
               </DialogActions>
             ) : null;

   return (
      <div>
         {openButton}
         <Dialog open={open} onClose={handleClose}>
            {/* Checks for being in add entry mode */}
            <DialogTitle>{type === "add" ? "Add Entry" : name}</DialogTitle>
            {/* Text fields are read-only when editing mode inactive */}
            <DialogContent>
               <TextField
                  margin="normal"
                  id="name"
                  label="Name"
                  fullWidth
                  variant="standard"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  InputProps={{
                     readOnly: !editable,
                   }}
               />
               <TextField
                  margin="normal"
                  id="link"
                  label="Link"
                  placeholder="e.g. https://google.com"
                  fullWidth
                  variant="standard"
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  InputProps={{
                     readOnly: !editable,
                   }}
               />
               <TextField
                  margin="normal"
                  id="description"
                  label="Description"
                  fullWidth
                  variant="standard"
                  multiline
                  maxRows={8}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  InputProps={{
                     readOnly: !editable,
                   }}
               />

               <FormControl fullWidth sx={{ "margin-top": 20 }}>
                  <InputLabel id="demo-simple-select-label">Category</InputLabel>
                  <Select
                     labelId="demo-simple-select-label"
                     id="demo-simple-select"
                     value={category}
                     label="Category"
                     onChange={(event) => setCategory(event.target.value)}
                     readOnly = {!editable}
                  >
                     {categories.map((category) => (<MenuItem value={category.id}>{category.name}</MenuItem>))}
                  </Select>
               </FormControl>
            </DialogContent>
            {actionButtons}
         </Dialog>
      </div>
   );
}
