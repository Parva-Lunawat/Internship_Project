export default function Sidebar ({onCreate}) {
    return (
        <aside className="w-20 h-full z-50 fixed bg-white border border-black-200 flex flex-col items-center gap-6 py-10">
            <div className="text-sm font-semibold text-zinc-900">Jotter</div>
            <button onclick={onCreate} type="button" className="h-10 w-10 rounded-full bg-zinc-900 text-black text-bold flex items-center justify-center shadow-sm hover:opacity-90 active:scale-[0.98]">
                +
            </button>
        </aside>
    );
}