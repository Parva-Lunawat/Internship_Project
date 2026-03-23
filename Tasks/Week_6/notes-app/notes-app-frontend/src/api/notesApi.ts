// import dotenv from 'dotenv';
import type { Note } from './note.type';
// dotenv.config();

const API_BASE = 'http://localhost:3000';
const NOTES_BASE = `${API_BASE}/api/v1/notes`;

async function request(path = "", options: RequestInit = {}) {
    const url = `${NOTES_BASE}${path}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
    // Determine if response is JSON
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json() : await res.text();
    if (!res.ok) {
        // Extract error message or fallback to status text
        const errorMsg = data?.message || data?.error || res.statusText || `Error ${res.status}`;
        throw new Error(errorMsg);
    }
    const unwrap = data.data;
    return unwrap;
}

export async function listNotes(q: string) {
    const qSearch = q ? `?q=${encodeURIComponent(q)}` : "";
    return request(`${qSearch}`, { method: "GET" });
}

export async function getNote(id: string) {
    if (!id) throw new Error("getNode: ID id required");
    return request(`/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function createNote(draft): Promise<Note> {
    // draft = { title, body?, color?, starred? }
    return request("", {
        method: "POST",
        body: JSON.stringify(draft),
    });
}

export async function updateNote(id: string, updates) {
    if (!id) throw new Error("updateNode: ID id required");
    return request(`/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
    });
}

export async function toggleStar(id: string) {
    if (!id) throw new Error("toggleStar: ID id required");
    return request(`/${encodeURIComponent(id)}/star`, { method: "PATCH" });
}

export async function deleteNote(id: string) {
    if (!id) throw new Error("deleteNote: id is required");
    return request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
}