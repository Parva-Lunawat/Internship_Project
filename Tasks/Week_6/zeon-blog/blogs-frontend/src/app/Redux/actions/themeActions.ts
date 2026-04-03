export const THEME_TOGGLE = "THEME_TOGGLE";
export const THEME_SET = "THEME_SET";

export const toggleTheme = () => ({
    type: THEME_TOGGLE,
});

export const setTheme = (theme: "light" | "dark") => ({
    type: THEME_SET,
    payload: theme,
});
