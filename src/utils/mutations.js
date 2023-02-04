import { addDoc, updateDoc, deleteDoc, doc, collection } from "firebase/firestore";
import EntryModal from "../components/EntryModal";
import { db } from './firebase';

// Functions for database mutations

export const emptyEntry = {
   name: "",
   link: "",
   description: "",
   user: "",
   category: 0,
   hits: 0
}

export async function addEntry(entry) {
   await addDoc(collection(db, "entries"), {
      name: entry.name,
      link: entry.link,
      description: entry.description,
      user: entry.user,
      category: entry.category,
      hits: 0,
      // The ID of the current user is logged with the new entry for database user-access functionality.
      // You should not remove this userid property, otherwise your logged entries will not display.
      userid: entry.userid,
   });
}

// Added functionality for ediing, adding hits to, and deleting entries
// Based on https://firebase.google.com/docs/firestore/manage-data/add-data

export async function updateEntry(entry, prevEntry) {
   const prev = doc(db, "entries", prevEntry.id)
   await updateDoc(prev, {
      name: entry.name,
      link: entry.link,
      description: entry.description,
      category: entry.category,
   });
}

export async function hitEntry(entry, prevEntry) {
   const prev = doc(db, "entries", prevEntry.id)
   await updateDoc(prev, {
      hits: entry.hits + 1,
   });
}

export async function deleteEntry(entry) {
   const prev = doc(db, "entries", entry.id)
   await deleteDoc(prev);
}
