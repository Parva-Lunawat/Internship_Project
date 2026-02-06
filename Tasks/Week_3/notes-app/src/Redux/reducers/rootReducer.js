import { combineReducers } from "@reduxjs/toolkit";
import notesReducer from "./noteReducer";
import themeReducer from "./themeReducer";

const rootReducer = combineReducers({
    notes: notesReducer,
    theme: themeReducer,
});

export default rootReducer;