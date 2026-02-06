import { THEME_SET, THEME_TOGGLE } from "../actions/themeAction";
import { CURR_THEME, ALT_THEME } from "../../constants/constants";

const initialState = {
    value: CURR_THEME,
}

export default function themeReducer(state = initialState, action) {
    switch(action.type) {
        case THEME_SET: {
            return {
                ...state,
                value: action.payload ?? CURR_THEME
            };
        }

        case THEME_TOGGLE: {
            return {
                ...state,
                value: (state.value === CURR_THEME ? ALT_THEME : CURR_THEME),
            };
        }

        default:
            return state;
    }
}