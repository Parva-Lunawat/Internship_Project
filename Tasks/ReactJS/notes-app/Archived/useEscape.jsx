// import { useEffect } from "react";

// export function useEscape (isActive, onEscape) {
//     useEffect(() => {
//         if(!isActive) return;
//         function handleEsc(event) {
//             if (event.key === "Escape") onEscape();
//         }
//         window.addEventListener("keydown", handleEsc);
//         return () => {
//             window.removeEventListener("keydown", handleEsc);
//         };
//     }, [isActive, onEscape]);
// }
// export function useNew (isActive, onNew) {
//     useEffect(() => {
//         if(!isActive) return;
//         function handleNew(event) {
//             if (!event.ctrlKey) return;

//             const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;;
//             if (key !== "C") return;
            
//                 event.preventDefault();
//                 onNew();
//         }
//         window.addEventListener("keydown", handleNew);
//         return () => {
//             window.removeEventListener("keydown", handleNew);
//         };
//     }, [isActive, onNew]);
// }
