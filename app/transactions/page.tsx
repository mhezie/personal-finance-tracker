"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: string;
  category: string;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setTransactions(data || []);
      setFilteredTransactions(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter((t) => t.type === filter)
      );
    }
  }, [filter, transactions]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error deleting transaction");
      console.error(error);
    } else {
      fetchTransactions();
    }
  };

  // Calculate total of filtered transactions
  const filteredTotal = filteredTransactions.reduce((sum, t) => {
    return t.type === "income" ? sum + Number(t.amount) : sum - Number(t.amount);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-200">
        <p className="text-lg text-gray-700">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <Navbar />

      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
          <Link
            href="/add-transaction"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add New
          </Link>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "income"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "expense"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Expense
          </button>
        </div>

        {/* Filtered Total */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 flex justify-between items-center">
          <span className="text-gray-600 font-medium">
            {filter === "all" ? "Net Total" : filter === "income" ? "Total Income" : "Total Expenses"}
          </span>
          <span className={`text-xl font-bold ${filteredTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
            {filteredTotal >= 0 ? "+" : ""}£{Math.abs(filteredTotal).toFixed(2)}
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600">No transactions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white p-5 rounded-xl shadow flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {transaction.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {transaction.category} • {transaction.date}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`text-lg font-bold ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}£
                    {Number(transaction.amount).toFixed(2)}
                  </div>

                  <Link
                    href={`/edit-transaction/${transaction.id}`}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}