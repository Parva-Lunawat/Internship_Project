import './App.css'
import NotesPage from './pages/NotesPage';
import 'remixicon/fonts/remixicon.css'
import { useCallback, useState, useEffect } from 'react';
import { themeType } from './context/themeContext';
import { KeyboardShortcutsContext, KeyboardShortcutsProvider } from './context/keyBoardShortcutsContext';


export default function App() {
  const [theme, setTheme] = useState("light");
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);
  useEffect(() => {
    console.log("Current theme:", theme);
  }, [theme]);
  return (
    <KeyboardShortcutsProvider>
      <themeType.Provider value={{ theme, toggleTheme }}>
        <NotesPage />
      </themeType.Provider>
    </KeyboardShortcutsProvider>
  );
}
