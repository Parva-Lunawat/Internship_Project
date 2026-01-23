import { useContext } from "react";
import { themeType } from "../context/themeContext";
export default function Topbar({ value, onChange }) {
    const { theme } = useContext(themeType);
    const isDark = theme === "dark";
    return (
        <div className="flex w-full h-full justify-center item-center gap-3">
            <span className="text-lg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            </span>
            <input value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search"
                className={`w-full max-w-sm placeholder:font-bold bg-transparent border rounded-full px-5
                ${isDark
                        ? "border-zinc-100 text-zinc-100 placeholder:text-zinc-400 focus:bg-zinc-800"
                        : "border-zinc-900 text-zinc-900 placeholder:text-zinc-500 focus:bg-white"}`} />
        </div>
    );
}