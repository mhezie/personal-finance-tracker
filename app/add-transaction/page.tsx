"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AddTransactionPage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You must be logged in");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        title,
        amount: parseFloat(amount),
        type,
        category,
        date,
      },
    ]);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Transaction added successfully!");
      setTitle("");
      setAmount("");
      setCategory("");
      setDate("");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Add Transaction
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g. Salary, Groceries"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g. Food, Transport, Salary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-400"
          >
            {loading ? "Adding..." : "Add Transaction"}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm font-medium ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}