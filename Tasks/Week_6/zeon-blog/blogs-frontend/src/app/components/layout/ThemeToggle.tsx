"use client";

import { useAppDispatch, useAppSelector } from "../../Redux/customStoreWrapper";
import { toggleTheme } from "../../Redux/actions/themeActions";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const dispatch = useAppDispatch();
    const theme = useAppSelector((state) => state.theme.theme);

    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            className="rounded-xl border border-gray-200 bg-gray-100 p-2 text-gray-800 shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 dark:border-gray-700 dark:bg-slate-800 dark:text-sky-100"
            aria-label="Toggle Theme"
        >
            {theme === "light" ? (
                <Moon className="h-5 w-5" />
            ) : (
                <Sun className="h-5 w-5" />
            )}
        </button>
    );
}
