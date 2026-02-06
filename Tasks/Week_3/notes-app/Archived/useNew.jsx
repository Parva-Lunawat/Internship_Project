import { useContext, useEffect } from "react";

// OG useNew
import { useEffect } from "react";

export function useNew (isActive, onNew) {
    useEffect(() => {
        if(!isActive) return;
        function handleNew(event) {
            if (!event.ctrlKey) return;

            const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;;
            if (key !== "C") return;
            
                event.preventDefault();
                onNew();
        }
        window.addEventListener("keydown", handleNew);
        return () => {
            window.removeEventListener("keydown", handleNew);
        };
    }, [isActive, onNew]);
}

