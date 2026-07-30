"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";

interface Transaction {
  id: number;
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

        transactions.forEach((t) => {
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

      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Balance */}
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500 mb-1">Current Balance</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              £{balance.toFixed(2)}
            </p>
          </div>

          {/* Income */}
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-600">
              £{totalIncome.toFixed(2)}
            </p>
          </div>

          {/* Expenses */}
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              £{totalExpenses.toFixed(2)}
            </p>
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
            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            View All Transactions
          </a>
        </div>

        <p className="text-center text-gray-600 mt-8">
          Logged in as: <span className="font-medium">{user?.email}</span>
        </p>
      </div>
    </div>
  );
}