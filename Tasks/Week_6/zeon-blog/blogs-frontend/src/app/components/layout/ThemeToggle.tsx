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
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm border border-gray-200 dark:border-gray-700"
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
