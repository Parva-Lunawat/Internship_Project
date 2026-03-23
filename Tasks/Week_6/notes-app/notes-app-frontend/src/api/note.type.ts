export type NoteColor = 'pink' | 'orange' | 'green' | 'violet' | 'blue';

export type Note = {
    id: string;
    title: string;
    body: string;
    color: NoteColor;
    starred: boolean;
    createdAt: string;
    updatedAt: string;
}