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
  AppleIcon,
  Bell,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const sidebarMenu = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Admins",
    href: "/admin/admins",
    icon: Crown,
  },
  {
    label: "Alert",
    href: "/admin/alert",
    icon: TriangleAlert,
  },
  {
    label: "Apple Varieties",
    href: "/admin/apples",
    icon: AppleIcon,
  },
  {
    label: "Blogs",
    href: "/admin/blogs",
    icon: Newspaper,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: BookA,
  },
  {
    label: "Marketting",
    href: "/admin/marketting",
    icon: Megaphone,
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderRoot,
  },
  {
    label: "Stats",
    href: "/admin/stats",
    icon: ChartArea,
  },
];

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

  // For exact /admin, highlight the Dashboard
  const activePath = pathname === "/admin" ? "/admin/dashboard" : pathname;

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
            {sidebarMenu.map(({ href, label, icon: Icon }) => {
              // active if the current path starts with href
              const isActive =
                activePath.startsWith(href) &&
                // avoid, e.g. /admin/apples matching /admin/application
                (activePath === href || activePath.startsWith(href + "/"));

              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center p-3 text-gray-800 rounded-lg transition-all duration-300 ease-in-out
                      hover:shadow-md hover:bg-green-100 hover:text-green-700
                      ${isActive ? "bg-green-100 text-green-700 shadow-md" : ""}
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {label}
                  </Link>
                </li>
              );
            })}
            {/* Logout */}
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
          &copy; 2025 Alilals Agrico
          <br />
          Made by{" "}
          <a
            href="https://www.instagram.com/harudstudios/"
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
