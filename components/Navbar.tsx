"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const linkClass = (path: string) =>
    pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-600 font-medium";

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link href="/" className="text-xl font-bold text-gray-900">
            Finance Tracker
          </Link>

          {/* Navigation Links */}
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