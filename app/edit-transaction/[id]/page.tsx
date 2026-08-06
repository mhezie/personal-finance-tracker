"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const categories = [
    "Food",
    "Transport",
    "Housing",
    "Salary",
    "Entertainment",
    "Utilities",
    "Shopping",
    "Other",
  ];

  useEffect(() => {
    const fetchTransaction = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setMessage("Transaction not found");
        setMessageType("error");
        setLoading(false);
        return;
      }

      setTitle(data.title);
      setAmount(data.amount.toString());
      setType(data.type);
      setCategory(data.category || "Food");
      setDate(data.date);
      setLoading(false);
    };

    if (id) {
      fetchTransaction();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setMessageType("");

    const { error } = await supabase
      .from("transactions")
      .update({
        title,
        amount: parseFloat(amount),
        type,
        category,
        date,
      })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
    } else {
      setMessage("Transaction updated successfully!");
      setMessageType("success");

      setTimeout(() => {
        router.push("/transactions");
      }, 1200);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-gray-900">
      <Navbar />

      <div className="flex items-center justify-center p-4 py-10">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            Edit Transaction
          </h1>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-center text-sm font-medium ${
                messageType === "success"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-400"
            >
              {saving ? "Saving..." : "Update Transaction"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}