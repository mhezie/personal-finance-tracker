"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Account created! Please check your email to confirm.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Sign Up</h1>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-medium disabled:bg-green-400"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-green-700 dark:text-green-400 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}