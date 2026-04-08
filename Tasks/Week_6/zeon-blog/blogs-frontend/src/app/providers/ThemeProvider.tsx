"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../Redux/customStoreWrapper";
import { setTheme } from "../Redux/actions/themeActions";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const theme = useAppSelector((state) => state.theme.theme);

    useEffect(() => {
        const savedTheme = window.localStorage.getItem("theme");
        if (savedTheme === "light" || savedTheme === "dark") {
            if (savedTheme !== theme) {
                dispatch(setTheme(savedTheme));
            }
            return;
        }

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        dispatch(setTheme(prefersDark ? "dark" : "light"));
    }, [dispatch, theme]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        root.style.colorScheme = theme;
    }, [theme]);

    return <>{children}</>;
}
