import { createSelector } from 'reselect';

// 1. Base selector to get raw items
const selectNotesItems = (state) => state.notes.items;

// 2. Memoized selector for sorted notes
export const selectSortedNotes = createSelector(
  [selectNotesItems],
  (items) => {
    return [...items].sort((a, b) => {
      // Sort by Starred (Boolean)
      if (Number(b.starred) !== Number(a.starred)) {
        return Number(b.starred) - Number(a.starred);
      }
      // Sort by Updated Date (Latest first)
      // We use || '' to prevent localeCompare errors on null dates
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    });
  }
);