import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
function incrementX (currVal) {
  return currVal + 1;
}
function trial (x) {
  if (x === 10) {
    return (
      <>
        <div>
          <h2>Wow It worked!</h2>
        </div>
      </>
    );
  }
  return null;
}
function showBtn(x, setX) {
  if (x!==10) {
    return (
      <>
      <button onClick={() => {
                setX(incrementX(x));
                removeBtn(x);
              }}>Click Me</button>
              
      <p>{x}</p>
    </>
    );
  }
  return (
    <>
      <p>{x}</p>
      <div>{trial(x)}</div>
    </>
  );
}
export default function App() { 
  const [x, setX] = useState(0)
  return (
      <>
        <div>
          <h1>Hello World</h1>
          <p>{showBtn(x, setX)}</p>
        </div>
      </>
    );
}

