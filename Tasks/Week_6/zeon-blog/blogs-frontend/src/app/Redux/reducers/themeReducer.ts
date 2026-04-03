import { THEME_TOGGLE, THEME_SET } from "../actions/themeActions";

type themeState = {
    theme: "light" | "dark";
};

const getInitialTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
    }
    return "light";
};

const initialState: themeState = {
    theme: getInitialTheme(),
};

type ThemeAction =
    | { type: typeof THEME_TOGGLE }
    | { type: typeof THEME_SET; payload: "light" | "dark" };

export default function themeReducer(state: themeState = initialState, action: ThemeAction): themeState {
    switch (action.type) {
        case THEME_TOGGLE: {
            const newTheme = state.theme === "light" ? "dark" : "light";
            if (typeof window !== "undefined") {
                localStorage.setItem("theme", newTheme);
            }
            return {
                ...state,
                theme: newTheme,
            };
        }
        case THEME_SET: {
            if (typeof window !== "undefined") {
                localStorage.setItem("theme", action.payload);
            }
            return {
                ...state,
                theme: action.payload,
            };
        }
        default:
            return state;
    }
}
