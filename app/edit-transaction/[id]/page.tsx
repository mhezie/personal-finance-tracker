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
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTransaction = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setMessage("Transaction not found");
        setLoading(false);
        return;
      }

      setTitle(data.title);
      setAmount(data.amount.toString());
      setType(data.type);
      setCategory(data.category);
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
    } else {
      setMessage("Transaction updated successfully!");
      setTimeout(() => {
        router.push("/transactions");
      }, 1000);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-200">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <Navbar />

      <div className="flex items-center justify-center p-4 py-10">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
            Edit Transaction
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-400"
            >
              {saving ? "Saving..." : "Update Transaction"}
            </button>
          </form>

          {message && (
            <p className={`mt-4 text-center text-sm font-medium ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}