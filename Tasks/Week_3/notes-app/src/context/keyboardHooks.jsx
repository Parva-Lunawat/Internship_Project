import { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { themeToggle } from "../Redux/actions/themeAction";
import { KeyboardShortcutsContext } from "./keyBoardShortcutsContext";

export function useNewNoteShortcut (isActive, onNew) {
    const {addShortcut, removeShortcut} = useContext(KeyboardShortcutsContext);
    useEffect(() => {
        if(!isActive) return;
        addShortcut("CTRL+C", onNew, "Create New Note");
        return () => {
            removeShortcut("CTRL+C");
        };
    }, [isActive, onNew]);
}

export function useEscape (isActive, onEscape) {
    const {addShortcut, removeShortcut} = useContext(KeyboardShortcutsContext);
    useEffect(() => {
        if(!isActive) return;
        addShortcut("ESCAPE", onEscape, "Close Window");
        return () => {
            removeShortcut("ESCAPE");
        };
    }, [isActive, onEscape]);
}

export function useEnter (isActive, onEnter) {
    const {addShortcut, removeShortcut} = useContext(KeyboardShortcutsContext);
    useEffect(() => {
        if(!isActive) return;
        addShortcut("ENTER", onEnter, "Submit Note");
        return () => {
            removeShortcut("ENTER");
        };
    }, [isActive, onEnter]);
}
export function useChangeTheme(isActive) {
    const {addShortcut, removeShortcut} = useContext(KeyboardShortcutsContext);
    const dispatch = useDispatch();
    const toggleTheme = () => dispatch(themeToggle());
    useEffect(() => {
        if (isActive) return;
        addShortcut("ALT+L", toggleTheme, "Toggle Theme");
        return () => {
            removeShortcut("ALT+L");
        };
    }, [isActive, toggleTheme, addShortcut, removeShortcut])
} 

