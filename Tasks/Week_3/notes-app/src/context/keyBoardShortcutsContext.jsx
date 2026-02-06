import { createContext, useEffect, useRef } from "react";

export const KeyboardShortcutsContext = createContext(null);

export function KeyboardShortcutsProvider({ children }) {
    const shortcutsHolder = useRef(new Map());
    function addShortcut(combo, handler) {
        shortcutsHolder.current.set(combo, handler);
    }
    function removeShortcut(combo) {
        shortcutsHolder.current.delete(combo);
    }
    useEffect(() => {
        function handleKey(event) {
            // No Shortcut while typing
            const tag = event.target?.tagName;
            const isTypingTarget = tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable === true;
            if (isTypingTarget) return;

            let parts = [];
            if (event.ctrlKey) parts.push("CTRL");
            if (event.shiftKey) parts.push("SHIFT");
            if (event.altKey) parts.push("ALT");

            const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
            // const key = event.key;
            if (/[a-zA-Z\/]/.test(key)) {
                parts.push(key.toUpperCase());
            }
            const combo = parts.join("+");
            const handler = shortcutsHolder.current.get(combo);
            if (handler) {
                event.preventDefault();
                handler();
            }
            console.log(combo);
        }
        window.addEventListener("keydown", handleKey);
        return () => {
            window.removeEventListener("keydown", handleKey);
        };
    }, []);
    return (
        <KeyboardShortcutsContext.Provider value={{ addShortcut, removeShortcut }}>
            {children}
        </KeyboardShortcutsContext.Provider>
    );
}