"use client";

import {
  LayoutDashboard,
  TriangleAlert,
  Crown,
  LogOut,
  Newspaper,
  ChartArea,
  FolderRoot,
  BookA,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Sidebar = () => {
  const { logout, currentUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

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
      <div className="bg-green-50 text-gray-800 w-64 min-h-screen flex flex-col justify-between shadow-lg">
        <div className="p-6">
          {/* Logo */}
          <Link href="/">
            <h1 className="text-3xl font-extrabold text-green-700 mb-8 transition-colors hover:text-green-500">
              Alilals Admin
            </h1>
          </Link>

          {/* Menu Items */}
          <ul className="space-y-4">
            <li>
              <Link
                href="/admin/dashboard"
                className={`flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 hover:text-green-700 ${pathname === "/admin/dashboard" ? "bg-green-100 text-green-700 shadow-md" : ""}`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                href="/admin/alert"
                className={`flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 hover:text-green-700 ${pathname === "/admin/alert" ? "bg-green-100 text-green-700 shadow-md" : ""}`}
              >
                <TriangleAlert className="w-5 h-5 mr-3" />
                Alert
              </Link>
            </li>

            <li>
              <Link
                href="/admin/bookings"
                className={`flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 hover:text-green-700 ${pathname === "/admin/bookings" ? "bg-green-100 text-green-700 shadow-md" : ""}`}
              >
                <BookA className="w-5 h-5 mr-3" />
                Bookings
              </Link>
            </li>

            <li>
              <Link
                href="/admin/stats"
                className={`flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 hover:text-green-700 ${pathname === "/admin/stats" ? "bg-green-100 text-green-700 shadow-md" : ""}`}
              >
                <ChartArea className="w-5 h-5 mr-3" />
                Stats
              </Link>
            </li>

            <li>
              <Link
                href="/admin/blogs"
                className={`flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 hover:text-green-700 ${pathname === "/admin/blogs" ? "bg-green-100 text-green-700 shadow-md" : ""}`}
              >
                <Newspaper className="w-5 h-5 mr-3" />
                Blogs
              </Link>
            </li>

            <li>
              <Link
                href="/admin/projects"
                className={`flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 hover:text-green-700 ${pathname === "/admin/projects" ? "bg-green-100 text-green-700 shadow-md" : ""}`}
              >
                <FolderRoot className="w-5 h-5 mr-3" />
                Projects
              </Link>
            </li>

            <li>
              <Link
                href="/admin/admins"
                className={`flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 hover:text-green-700 ${pathname === "/admin/admins" ? "bg-green-100 text-green-700 shadow-md" : ""}`}
              >
                <Crown className="w-5 h-5 mr-3" />
                Admins
              </Link>
            </li>

            <li>
              <div
                onClick={logoutHandler}
                className="flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 hover:text-green-700 cursor-pointer"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </div>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 bg-green-200 text-green-800 text-center">
          &copy; 2025 Alilals
          <br />
          Made by{" "}
          <a
            href="https://harudstudios.framer.website"
            className="underline hover:text-green-500"
          >
            Harud Studios
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
