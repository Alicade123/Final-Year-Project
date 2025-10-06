// // src/components/admin/AdminDashboard.jsx

import React, { useState } from "react";
import AdminUsers from "../components/admin/AdminUsers";
import AdminHubs from "../components/admin/AdminHubs";
import { LogOut, Users, MapPin } from "lucide-react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between bg-white shadow-sm px-6 py-4">
        <h1 className="text-2xl font-bold text-emerald-700 tracking-tight">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap gap-3 bg-white border-b px-6 py-3">
        <button
          onClick={() => setTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "users"
              ? "bg-emerald-600 text-white shadow"
              : "bg-gray-100 hover:bg-emerald-50 text-gray-700"
          }`}
        >
          <Users size={16} />
          Users
        </button>

        <button
          onClick={() => setTab("hubs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "hubs"
              ? "bg-emerald-600 text-white shadow"
              : "bg-gray-100 hover:bg-emerald-50 text-gray-700"
          }`}
        >
          <MapPin size={16} />
          Hubs
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {tab === "users" && <AdminUsers />}
        {tab === "hubs" && <AdminHubs />}
      </main>
    </div>
  );
}
