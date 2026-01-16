import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import NotesGrid from '../components/Notesgrid';
import {useState} from "react";


export default function NotesPage() {
    const [notes, setNotes] = useState([
        {
            id: "1",
            title: "The beginning of this page",
            body: "",
            color: "bg-yellow-200",
            starred: false,
            createdAt: new Date("2020-05-21"),
        },
    ]);
    return (
        <div className="min-h-lvh max-h-max bg-zinc-500">
            <div className="flex">
                <Sidebar />
                <main className="flex-1">
                    <div className="ml-16 px-10 pt-8">
                        <Topbar />
                        <h1 className="mt-6 text-6xl font-extrabold tracking-tight text-zinc-900">
                            Notes
                        </h1>
                        <div className="py-10">
                            <NotesGrid notes={notes}/>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
