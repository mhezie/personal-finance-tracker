"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const currentlyDark = document.documentElement.classList.contains("dark");
    setIsDark(currentlyDark);
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    await supabase.auth.signOut();
    router.push("/login");
  };

  const linkClass = (path: string) =>
    pathname === path
      ? "text-blue-600 font-semibold dark:text-blue-400"
      : "text-gray-700 hover:text-blue-600 font-medium dark:text-gray-300 dark:hover:text-blue-400";

  return (
    <nav className="bg-white shadow-md dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            Finance Tracker
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/" className={linkClass("/")}>
              Dashboard
            </Link>
            <Link href="/transactions" className={linkClass("/transactions")}>
              Transactions
            </Link>
            <Link href="/add-transaction" className={linkClass("/add-transaction")}>
              Add Transaction
            </Link>

            <button
              onClick={toggleDarkMode}
              className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition"
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}