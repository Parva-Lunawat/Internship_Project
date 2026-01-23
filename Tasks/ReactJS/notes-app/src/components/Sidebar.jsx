import { themeType } from "../context/themeContext";
import { useContext } from "react";

export default function Sidebar({ onCreate, onTools }) {
    const { theme, toggleTheme } = useContext(themeType);
    return (
        <aside className="w-20 h-full z-50 fixed bg-white border-r border-black-200 flex flex-col justify-between items-center gap-6 py-10 ">
            <div className="flex flex-col items-center gap-6 py-10 ">
                <div className="text-2xl font-bold text-zinc-900">Jotter</div>
                <button title="Create Note" onClick={onCreate} type="button" className="h-10 w-10 rounded-full bg-zinc-900 text-black text-bold flex items-center justify-center shadow-sm hover:opacity-90 active:scale-[0.98]">
                    <b>+</b>
                </button>
                <label className="relative inline-block w-[60px] h-[34px]">
                    <input type="checkbox" className="opacity-100 w-0 h-0 peer"
                        checked={theme === "dark"}
                        onChange={toggleTheme} />
                    <span className="absolute inset-0 cursor-pointer rounded-[34px] border bg-zinc-200 transition-colors duration-300 peer-checked:bg-zinc-800 peer-checked:[&>span]:translate-x-[26px] peer-checked:[&>span]:bg-zinc-200">
                        <span className="absolute left-1 bottom-1 h-[24px] w-[24px] rounded-full bg-zinc-500 transition-transform duration-300"></span>
                    </span>
                </label>
            </div>
            <div>
                <button title="View Tips" onClick={onTools} type="button" className="h-10 w-10 rounded-full bg-zinc-900 text-black font-bold flex items-center justify-center shadow-sm hover:opacity-90 active:scale-[0.98]">
                    <i className="ri-tools-line font-black"></i>
                </button>
            </div>
        </aside>
    );
}