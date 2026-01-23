# ReactJS

### Important from JS 
*   `let` / `const`
*   Arrow functions `() => {}`
*   Array methods: `map`, `filter`, `reduce`
*   Destructuring
*   Spread operator `...`

### ReactJS => frontend JS Library
Instead of manipulating the browser's DOM directly, React creates a **virtual DOM** in memory, where it does all the necessary manipulating, before making the changes in the browser DOM.

#### React Specials
*   `<StrictMode>` runs everything twice in dev

### Destructuring
Use `props` keyword then can call using `props.name` etc. or use direct destructure.

### Hook Rules
*   Hooks can only be called inside **React function components**.
*   Hooks can only be called at the **top level** of a component.
*   Hooks **cannot be conditional**.

#### `useState` Hook:
Allows to track state in a function component.

#### `useEffect` Hook:
Allows to perform side effects in your components (i.e., agar ye hota hai toh hi yeh re-render ya hone dena).
```javascript
useEffect(() => {
    // Runs on the first render
    // And any time any dependency value changes
}, [prop, state]);
```
``` sql
useEffect
 ├─ define async logic
 ├─ schedule it (timeout / interval)
 ├─ cleanup EVERYTHING
```

#### `useContext` Hook:
Like global useState hook. Allows multi level below child to use the state w/o passing it down the multiple levels required
Make a Global context ie
```javascript
export const userNameContext = React.createContext()
```
then wrap the inside of main rendered like App in my case ```<NotePages />``` inside context wrapper like
```javascript
<userNameContext.Provider value="Parva">
    <NotePages /> 
</userNameContext.Provider>
```
Usage: = (hence no need to pass the state as prop in middle 2 layers)
```javascript
import { userNameContext } from '../../../App'
const user = useContext(userNameContext);
```

#### `useCallback` Hook:
Same as useMemo just memoizes the function instead of value

#### `useMemo` Hook:
Same as useCallback just memoizes the value instead of function