In React, "mounting" and "unmounting" are not magic; they are just labels for when a component is added to or removed from the browser's Document Object Model (DOM).

### 1. Mounting: The "Setup" Phase
When a user navigates to a page containing your `<App />` component, React "mounts" it.
* **The Logic:** React executes your `useEffect` code.
* **What Happens:** `window.addEventListener('keydown', handleEsc)` runs once. The browser now has a direct reference to your function in its memory.

### 2. Unmounting: The "Teardown" Phase
When the user navigates away or a condition makes the component disappear, React "unmounts" it.
* **The Logic:** React runs the function you returned inside `useEffect`.
* **What Happens:** `window.removeEventListener('keydown', handleEsc)` tells the browser to stop watching for that specific function on that event.

### What happens if you forget the "Unmount" cleanup?

If you remove the `return () => ...` block, you create a **Memory Leak**. This causes serious issues because the global `window` object lives for the entire duration of the browser tab's life, regardless of what React is doing.

#### Example: The "Zombie" Listener
Imagine your app has a "Home" page and a "Settings" page. Your Escape key logic is only on the Settings page.

1.  **User enters Settings:** A listener is added.
2.  **User leaves Settings (Unmount):** You forget to remove the listener.
3.  **The Bug:** The user is now on the Home page. They press Escape. Even though the Settings component is "gone," the console still logs "Close". The function has become a "zombie"—it’s dead to React, but alive in the browser's memory.

#### Example: The "Memory Explosion"
If the user navigates back and forth between Home and Settings 10 times:

*   **Without Cleanup:** You will have 10 identical listeners running at the same time.
*   **The Consequence:** Every time the user presses Escape, your app will perform the logic 10 times. Over time, this consumes more RAM and CPU, eventually making the app laggy or causing it to crash.


