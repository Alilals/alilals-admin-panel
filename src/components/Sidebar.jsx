"use client";

import { LayoutDashboard, Settings, LogOut, Newspaper, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Sidebar = () => {
  const { logout, currentUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const logoutHandler = async () => {
    await logout();
    router.push("/login");
    toast({
      title: "Logged out successfully!",
      description: "",
      className: "bg-green-500 text-white border border-green-700",
    });
  };

  return (
    <div className={`flex ${!currentUser ? "hidden" : ""}`}>
      {/* Sidebar */}
      <div
        className={`bg-gray-100 text-gray-800 w-64 min-h-screen flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 md:hidden"
          onClick={toggleMenu}
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        <div className="p-6">
          {/* Logo */}
          <Link href="/">
            <h1 className="text-2xl font-bold text-purple-600 mb-6">
              Alilals Admin
            </h1>
          </Link>

          {/* Menu Items */}
          <ul>
            <li className="mb-4">
              <Link
                href="/admin/dashboard"
                className={`flex items-center p-2 text-gray-800 hover:bg-purple-100 hover:text-purple-600 rounded-lg transition-colors ${pathname == "/dashboard" ? "text-purple-600 bg-purple-100 " : ""}`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
            </li>

            <li className="mb-4">
              <Link
                href="/admin/blogs"
                className={`flex items-center p-2 text-gray-800 hover:bg-purple-100 hover:text-purple-600 rounded-lg transition-colors ${pathname == "/blogs" ? "text-purple-600 bg-purple-100 " : ""}`}
              >
                <Newspaper className="w-5 h-5 mr-3" />
                Blogs
              </Link>
            </li>

            <li className="mb-4">
              <Link
                href="/admin/admins"
                className={`flex items-center p-2 text-gray-800 hover:bg-purple-100 hover:text-purple-600 rounded-lg transition-colors ${pathname == "/admins" ? "text-purple-600 bg-purple-100 " : ""}`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Admins
              </Link>
            </li>

            <li className="mb-4">
              <div
                onClick={logoutHandler}
                className="flex items-center p-2 text-gray-800 hover:bg-purple-100 hover:text-purple-600 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </div>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 bg-purple-100 text-purple-800 text-center">
          &copy; 2024 Alilas
          <br />
          Made by{" "}
          <a href="https://harudstudios.framer.website" className="underline">
            Harud Studios
          </a>
        </div>
      </div>

      {/* Hamburger Icon for Mobile */}
      {!isOpen && (
        <button
          className="md:hidden p-4 bg-gray-100 text-gray-800 fixed top-4 left-4 z-50"
          onClick={toggleMenu}
        >
          <LayoutDashboard className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default Sidebar;
