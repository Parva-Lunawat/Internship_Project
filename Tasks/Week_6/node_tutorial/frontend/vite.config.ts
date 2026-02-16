import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

export default defineConfig({
  plugins: [react()],
    server: {
        proxy: {
            "/api": "http://localhost:3000", 
        },
    },
});

// Tells the Vite dev server:
// “If the browser requests certain paths, forward those requests to another server instead of serving them from Vite.”

// Without proxy, your frontend is at:
// http://localhost:5173
// And backend is at:
// http://localhost:5000
// That’s cross-origin, so the browser blocks it unless backend adds CORS headers.
// With proxy:
    // Browser thinks it’s requesting http://localhost:5173/api/... (same origin)
    // Vite internally forwards it server-to-server
    // Browser sees a same-origin response → no CORS enforcement