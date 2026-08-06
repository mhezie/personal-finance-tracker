"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface Transaction {
  amount: number;
  type: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("amount, type");

      if (error) {
        console.error(error);
      } else if (transactions) {
        let income = 0;
        let expenses = 0;

        transactions.forEach((t: Transaction) => {
          if (t.type === "income") {
            income += Number(t.amount);
          } else {
            expenses += Number(t.amount);
          }
        });

        setTotalIncome(income);
        setTotalExpenses(expenses);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const balance = totalIncome - totalExpenses;

  const chartData = [
    { name: "Income", amount: totalIncome },
    { name: "Expenses", amount: totalExpenses },
  ];

  const colors = ["#16a34a", "#dc2626"];

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

      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Balance</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              £{balance.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-600">
              £{totalIncome.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              £{totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Income vs Expenses</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <a
            href="/add-transaction"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Transaction
          </a>
          <a
            href="/transactions"
            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            View All Transactions
          </a>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
          Logged in as: <span className="font-medium">{user?.email}</span>
        </p>
      </div>
    </div>
  );
}