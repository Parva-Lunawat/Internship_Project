export default function Modal({open, title, children, onClose}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            <div onClick={onClose} className="absolute inset-0 bg-black/30"></div>
            <div className="absolute left-4/100 -top-23/100 bottom-0 right-0 flex items-center justify-between p-5">
                <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                    <div className="flex items-center justify-between px-5 py-3 border-b-5">
                        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
                        <button type="button" onClick={onClose} 
                            className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100">
                            ESC
                        </button>
                    </div>
                    <div className="px-6 py-5 max-h-[50vh] overflow-auto">{children}</div>
                </div>
            </div>
        </div>
    );
}