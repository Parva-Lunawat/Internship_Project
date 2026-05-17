import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ReduxProvider from "./providers/ReduxProvider";
import ThemeProvider from "./providers/ThemeProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Zeon Blog Platform",
  description: "Blogging Platform made by Parva Lunawat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-gray-900 transition-colors duration-300 dark:bg-slate-950 dark:text-gray-100">
        <ReduxProvider>
          <ThemeProvider>
            <Navbar />
            <main className="flex-grow w-full mx-auto max-w-7xl px-6 py-10">{children}</main>
            <Footer />
            <ToastContainer position="top-right" autoClose={3000} />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
