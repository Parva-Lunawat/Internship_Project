import { createContext } from "react";

export const themeType = createContext({
    theme: "light",
    toggleTheme: () => {},
});
