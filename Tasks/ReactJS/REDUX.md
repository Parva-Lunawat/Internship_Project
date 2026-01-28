Redux Notes

The ALL Father of "useContext".
just a publisher - subscriber communication and handling method
uses a CEntral Store for all useContext requirements

Redux is really:
    A single store containing "global" state
    Dispatching plain object actions to the store when something happens in the app
    Pure reducer functions looking at those actions and returning immutably updated state

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'

import { Provider } from 'react-redux'
import store from './store'

import App from './App'

// As of React 18
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <App />
  </Provider>,
)
```
REDUX Hooks: -
    useSelector: reads val from store + subscribe to updates (Subscriber)
    useDispatch: returns store's dispatch

```jsx
import { useSelector, useDispatch } from 'react-redux'
```

Key Pillars of Redux: 
    Store : Central Container holding all global state (Only ONE for each app)
    Slice : One feature (i.e Cart) with
        State (i.e [], totalQuantity = 0 => empty cart) + Reducers (one that holds all actions) + Actions (addItem, removeItem)
    Reducer : pure function deciding next state; takes currState+ currAction -> gives nextState
    Action: an object describing some happening like a JSON Payload then lets reducer decide what to do
    Selector : Data fetcher and nothing more
    
    
