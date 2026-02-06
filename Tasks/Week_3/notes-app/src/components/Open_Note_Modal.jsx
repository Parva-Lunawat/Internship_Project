import { useSelector } from "react-redux";
import { selectIsDark, selectTheme } from "../Redux/selector-functions/themeSelector";

export default function Modal({ open, title, children, onClose }) {
    if (!open) return null;
    const theme = useSelector(selectTheme);
    const isDark = useSelector(selectIsDark);
    return (
        <div className="fixed inset-0 z-50">
            <div onClick={onClose} className={`absolute inset-0 ${isDark ? "bg-black/60" : "bg-black/40"}`}></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
                <div className={`w-full pb-1 max-w-xl rounded-2xl shadow-xl
                    ${isDark
                        ? "bg-zinc-800 text-zinc-100 border-2"
                        : "bg-white text-zinc-900 border-2"}`}>
                    <div className={`flex items-center justify-between px-5 py-3 border-b-8 ${isDark ? "border-zinc-100" : "border-zinc-800"}`}>
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <button type="button" onClick={onClose}
                            className={`rounded-lg px-3 py-1.5 text-sm text-zinc-900 ${isDark ? "hover:bg-zinc-700" : "hover:bg-zinc-200"}`}>
                            ESC
                        </button>
                    </div>
                    <div className="px-6 pt-5 mb-5 max-h-[60vh] overflow-auto">{children}</div>
                </div>
            </div>
        </div>
    );
}