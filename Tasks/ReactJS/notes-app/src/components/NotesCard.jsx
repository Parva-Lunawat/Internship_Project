// note = {
//   id: string,
//   title: string,
//   body: string,
//   color: string,
//   starred: boolean,
//   createdAt: Date
// }



export default function NoteCard({note}) {
    const formattedDate = note.createdAt.toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    return (
        <article className={`flex flex-col p-6 ${note.color} rounded-2xl shadow-sm`}>
            <div className="flex justify-between content-center align-center content-evenly">
                <p className="text-zinc-900 leading-snug content-center font-medium">
                    {note.title}
                </p>
                <button className="h-10 w-10 rounded-full bg-white/30 text-zinc-900 flex items-center justify-center">
                    Star
                </button>
            </div>
            <p>
                min-height: 100vh !important;
            /* max-height: max-content; */min-height: 100vh !important;
            /* max-height: max-content; */min-height: 100vh !important;
            /* max-height: max-content; */min-height: 100vh !important;
            /* max-height: max-content; */min-height: 100vh !important;
            /* max-height: max-content; */min-height: 100vh !important;
            /* max-height: max-content; */
            </p>
            <div className="flex justify-between content-center align-center content-evenly">
                <div className="text-sm text-zinc-700 leading-snug content-center font-medium">
                    {formattedDate}
                </div>
                <button className="h-10 w-10 rounded-full bg-white/30 text-zinc-900 flex items-center justify-center">
                    Edit
                </button>
            </div>
        </article>
    );
}
