// note = {
//   id: string,
//   title: string,
//   body: string,
//   color: string,
//   starred: boolean,
//   createdAt: Date
// }
import { useSelector } from "react-redux";
import { selectIsDark, selectTheme } from "../Redux/selector-functions/themeSelector";
import { COLOR_MAP } from "../constants/constants";

export default function NoteCard({ note, onEdit, onStar, onView }) {
    const theme = useSelector(selectTheme);
    const isDark = useSelector(selectIsDark);
    const formattedDate = new Date(note.createdAt).toLocaleDateString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
    const bgClass = COLOR_MAP[theme][note.color];

    return (
        <article className={`relative flex flex-col p-6 ${bgClass} rounded-2xl shadow-sm overflow-hidden min-h-[240px]`}>
            <div className="flex items-start justify-between gap-3">
                <p className="font-medium leading-snug break-words line-clamp-2">
                    {note.title}
                </p>
                <button type="button" onClick={(e) => { e.stopPropagation(); onStar(note.id); }} className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center
                    ${note.starred ? "text-yellow-300" : "text-zinc-900 hover:bg-white/50"}`}
                    title={note.starred ? "Unstar" : "Star"}
                >
                    {note.starred ? <i className="ri-star-fill" /> : <i className="ri-star-line" />}
                </button>
            </div>
            <div type="button" onClick={() => onView(note.id)}>
                <p className="mt-3 text-sm line-clamp-4">
                    {/* if want scrollable:= max-h-40 overflow-auto pr-1 */}
                    {note.body}
                </p>
            </div>
            <div className="mt-auto pt-6 flex items-center justify-between gap-3">
                <div className={`text-sm ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{formattedDate}</div>
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                    type="button"
                    className={`h-10 px-4 rounded-full flex items-center justify-center text-zinc-900 ${isDark
                        ? "hover:bg-zinc-700"
                        : "hover:bg-zinc-100"}`}
                >
                    Edit
                </button>
            </div>
        </article>
    );
}