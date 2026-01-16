import NoteCard from "./NotesCard";

export default function NotesGrid({notes}) {
  return (
    <div className=" grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
