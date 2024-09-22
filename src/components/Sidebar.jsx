"use client";

import { LayoutDashboard, Settings, LogOut, Newspaper } from "lucide-react";
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
      <div className="bg-gray-100 text-gray-800 w-64 min-h-screen flex flex-col justify-between shadow-lg">
        <div className="p-6">
          {/* Logo */}
          <Link href="/">
            <h1 className="text-3xl font-extrabold text-purple-700 mb-8 transition-colors hover:text-purple-500">
              Alilals Admin
            </h1>
          </Link>

          {/* Menu Items */}
          <ul className="space-y-4">
            <li>
              <Link
                href="/admin/dashboard"
                className={`flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-purple-100 hover:text-purple-700 ${pathname === "/admin/dashboard" ? "bg-purple-100 text-purple-700 shadow-md" : ""}`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                href="/admin/blogs"
                className={`flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-purple-100 hover:text-purple-700 ${pathname === "/admin/blogs" ? "bg-purple-100 text-purple-700 shadow-md" : ""}`}
              >
                <Newspaper className="w-5 h-5 mr-3" />
                Blogs
              </Link>
            </li>

            <li>
              <Link
                href="/admin/admins"
                className={`flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-purple-100 hover:text-purple-700 ${pathname === "/admin/admins" ? "bg-purple-100 text-purple-700 shadow-md" : ""}`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Admins
              </Link>
            </li>

            <li>
              <div
                onClick={logoutHandler}
                className="flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:bg-purple-100 hover:text-purple-700 cursor-pointer"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </div>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 bg-purple-200 text-purple-800 text-center">
          &copy; 2024 Alilas
          <br />
          Made by{" "}
          <a
            href="https://harudstudios.framer.website"
            className="underline hover:text-purple-500"
          >
            Harud Studios
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
