export default function ToolkitShortcuts() {
    const shortcuts = [
        ["CTRL+N", "Create new note"],
        ["ENTER", "Save note"],
        ["ALT+L", "Toggle theme"],
        ["ESC", "Close Panel/Window"],
    ];

    return (
        <div className="space-y-3">
            {shortcuts.map(([combo, label]) => (
                <div
                    key={combo}
                    className="font-bold flex items-center align-center justify-between gap-4 rounded-[10px] border px-3 py-2"
                >
                    <span className="pl-15 text-sm opacity-80">
                        {label}
                    </span>
                    <span className="mr-15 w-20 text-center font-mono text-sm bg-zinc-200 px-2 py-2 rounded-[10px] border-2">
                        {combo}
                    </span>
                </div>
            ))}
        </div>
    );
}
