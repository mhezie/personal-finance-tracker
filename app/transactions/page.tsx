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
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
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
    let result = [...transactions];

    if (filter !== "all") {
      result = result.filter((t) => t.type === filter);
    }

    if (search.trim() !== "") {
      result = result.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    setFilteredTransactions(result);
  }, [filter, search, sortOrder, transactions]);

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

  const clearFilters = () => {
    setFilter("all");
    setSearch("");
    setSortOrder("newest");
  };

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const headers = ["Title", "Amount", "Type", "Category", "Date"];
    const rows = filteredTransactions.map((t) => [
      t.title,
      t.amount,
      t.type,
      t.category,
      t.date,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTotal = filteredTransactions.reduce((sum, t) => {
    return t.type === "income" ? sum + Number(t.amount) : sum - Number(t.amount);
  }, 0);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
      Transport: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
      Housing: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
      Salary: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
      Entertainment: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200",
      Utilities: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
      Shopping: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
      Other: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    };
    return colors[category] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              ← Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              My Transactions
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
            >
              Export CSV
            </button>
            <Link
              href="/add-transaction"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
            >
              + Add New
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "income"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "expense"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Expense
          </button>

          <div className="w-px bg-gray-300 mx-1 hidden sm:block dark:bg-gray-600"></div>

          <button
            onClick={() => setSortOrder("newest")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortOrder === "newest"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortOrder("oldest")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortOrder === "oldest"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Oldest
          </button>

          {(filter !== "all" || search !== "" || sortOrder !== "newest") && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition dark:bg-red-900 dark:text-red-200"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Total */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <p className="text-gray-600 font-medium dark:text-gray-300">
              {filter === "all" ? "Net Total" : filter === "income" ? "Total Income" : "Total Expenses"}
            </p>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <span className={`text-xl font-bold ${filteredTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
            {filteredTotal >= 0 ? "+" : ""}£{Math.abs(filteredTotal).toFixed(2)}
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-xl shadow text-center">
            <p className="text-4xl mb-3">📭</p>
            <h3 className="text-lg font-semibold text-gray-800 mb-1 dark:text-white">No transactions found</h3>
            <p className="text-gray-500 mb-4 dark:text-gray-400">
              {search
                ? "No transactions match your search."
                : filter === "all"
                ? "You haven’t added any transactions yet."
                : `No ${filter} transactions to show.`}
            </p>
            <Link
              href="/add-transaction"
              className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add your first transaction
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              >
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {transaction.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(transaction.category)}`}>
                      {transaction.category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">• {transaction.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`text-lg font-bold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}£
                    {Number(transaction.amount).toFixed(2)}
                  </div>

                  <Link
                    href={`/edit-transaction/${transaction.id}`}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition dark:bg-blue-900 dark:text-blue-200"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition dark:bg-red-900 dark:text-red-200"
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