"use client";

import { useEffect } from "react";
import { useAppSelector } from "../Redux/customStoreWrapper";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useAppSelector((state) => state.theme.theme);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme]);

    return <>{children}</>;
}
