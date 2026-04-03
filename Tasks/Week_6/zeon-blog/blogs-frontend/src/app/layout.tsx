import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ReduxProvider>
          <ThemeProvider>
            <Navbar />
            <main className="flex-grow w-full mx-auto max-w-7xl px-6 py-10">{children}</main>
            <Footer />
            <ToastContainer position="bottom-right" autoClose={3000} />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
