import './App.css'
import NotesPage from './pages/NotesPage';
import 'remixicon/fonts/remixicon.css'
import { KeyboardShortcutsProvider } from './context/keyBoardShortcutsContext';


export default function App() {
  return (
    <KeyboardShortcutsProvider>
        <NotesPage />
    </KeyboardShortcutsProvider>
  );
}
