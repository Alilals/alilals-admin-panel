import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { FirestoreProvider } from "@/contexts/FirestoreContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Alilals Admin Panel",
  description: "This the the admin panel app for alilals agrico.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiase flex`}
      >
        <AuthProvider>
          <FirestoreProvider>
            <div className="hidden md:flex flex-grow">
              <Sidebar />
              <div className="flex-grow bg-gray-50 h-[100vh] overflow-auto">
                {children}
              </div>
            </div>
            <div className="flex md:hidden justify-center items-center h-screen bg-gray-100">
              <p className="text-lg text-red-500 font-bold text-center">
                The admin panel is not compatible with mobile devices.
              </p>
            </div>
            <Toaster />
          </FirestoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
