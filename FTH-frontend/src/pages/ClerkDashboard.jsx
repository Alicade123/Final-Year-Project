// src/pages/ClerkDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Search,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { clerkAPI } from "../services/api";
import { useAPI, useAPICall } from "../hooks/useAPI";
import { ProductModal } from "../components/ProductModel";
import { UserModal } from "../components/FarmerModel";
const menuItems = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "farmers", label: "Farmers", icon: Users },
  { key: "products", label: "Products", icon: Package },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "payouts", label: "Payouts", icon: DollarSign },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function ClerkDashboard() {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 text-white flex-col shadow-2xl">
        <div className="p-6 border-b border-emerald-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl">Farmers Hub</h1>
              <p className="text-emerald-300 text-xs">Collection Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`group flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg scale-105"
                    : "hover:bg-emerald-700/50 text-emerald-100"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-white"
                      : "text-emerald-300 group-hover:text-white"
                  }
                />
                <span className={isActive ? "text-white" : ""}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-emerald-100 hover:bg-red-900/50 transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="w-72 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 text-white h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-emerald-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="font-bold text-xl">Farmers Hub</h1>
                  <p className="text-emerald-300 text-xs">Collection Center</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-emerald-300 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActive(item.key);
                      setSidebarOpen(false);
                    }}
                    className={`group flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg"
                        : "hover:bg-emerald-700/50 text-emerald-100"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-neutral-200 shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-neutral-600 hover:text-emerald-600"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 capitalize">
                {active}
              </h2>
              <p className="text-sm text-neutral-500">
                Manage your hub operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
              />
            </div>

            <button className="relative p-2 hover:bg-neutral-100 rounded-xl transition-colors">
              <Bell size={20} className="text-neutral-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-neutral-800">
                  Clerk Manager
                </p>
                <p className="text-xs text-neutral-500">Ruhango Hub</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                CM
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <section className="flex-1 p-6 overflow-y-auto">
          {active === "overview" && <Overview />}
          {active === "farmers" && <Farmers />}
          {active === "products" && <Products />}
          {active === "orders" && <Orders />}
          {active === "payouts" && <Payouts />}
          {active === "reports" && <Reports />}
          {active === "notifications" && <Notifications />}
          {active === "settings" && <SettingsTab />}
        </section>
      </main>
    </div>
  );
}

// Loading Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="animate-spin text-emerald-600" size={48} />
    </div>
  );
}

// Error Component
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertCircle className="mx-auto text-red-600 mb-3" size={48} />
      <h3 className="text-lg font-bold text-red-800 mb-2">
        Error Loading Data
      </h3>
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Overview Component with API Integration
function Overview() {
  const {
    data: stats,
    loading,
    error,
    refetch,
  } = useAPI(() => clerkAPI.getDashboardStats());
  const { data: activity } = useAPI(() => clerkAPI.getRecentActivity(5));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const statsData = [
    {
      label: "Total Farmers",
      value: stats?.farmers || 0,
      change: "+12%",
      icon: Users,
      color: "emerald",
    },
    {
      label: "Products Listed",
      value: stats?.products || 0,
      change: "+8%",
      icon: Package,
      color: "blue",
    },
    {
      label: "Active Orders",
      value: stats?.orders || 0,
      change: "+23%",
      icon: ShoppingCart,
      color: "amber",
    },
    {
      label: "Revenue (Monthly)",
      value: `$${stats?.revenue?.toLocaleString() || 0}`,
      change: "+15%",
      icon: DollarSign,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith("+");
          return (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-xl shadow-md`}
                >
                  <Icon className="text-white" size={24} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    isPositive ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-neutral-800 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-800">
              Recent Activity
            </h3>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {activity && activity.length > 0 ? (
              activity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">
                      {item.description}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl p-3 text-left font-medium transition-all flex items-center gap-3">
              <Plus size={18} />
              Add New Farmer
            </button>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl p-3 text-left font-medium transition-all flex items-center gap-3">
              <Package size={18} />
              Register Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// // // Farmers Component with API Integration
// function Farmers() {
//   const [page, setPage] = useState(1);
//   const { data, loading, error, refetch } = useAPI(
//     () => clerkAPI.getFarmers(page, 20),
//     [page]
//   );
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   if (loading) return <LoadingSpinner />;
//   if (error) return <ErrorMessage message={error} onRetry={refetch} />;

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <h3 className="text-2xl font-bold text-neutral-800">
//             Registered Farmers
//           </h3>
//           <p className="text-neutral-500">Total: {data?.total || 0} farmers</p>
//         </div>
//         <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
//           <Plus size={18} />
//           Add Farmer
//         </button>
//       </div>

//       <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
//                   Name
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
//                   Phone
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
//                   Location
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
//                   Deliveries
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
//                   Status
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {data?.farmers?.map((farmer, i) => (
//                 <tr
//                   key={i}
//                   className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
//                 >
//                   <td className="px-6 py-4 font-medium text-neutral-800">
//                     {farmer.full_name}
//                   </td>
//                   <td className="px-6 py-4 text-neutral-600">{farmer.phone}</td>
//                   <td className="px-6 py-4 text-neutral-600">
//                     {farmer.location || "N/A"}
//                   </td>
//                   <td className="px-6 py-4 text-neutral-600">
//                     {farmer.total_deliveries || 0}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
//                         farmer.is_active
//                           ? "bg-emerald-100 text-emerald-700"
//                           : "bg-neutral-100 text-neutral-700"
//                       }`}
//                     >
//                       {farmer.is_active ? (
//                         <CheckCircle size={12} />
//                       ) : (
//                         <Clock size={12} />
//                       )}
//                       {farmer.is_active ? "Active" : "Inactive"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2">
//                       <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
//                         <Edit size={16} className="text-blue-600" />
//                       </button>
//                       <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
//                         <Trash2 size={16} className="text-red-600" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       {data?.total > 20 && (
//         <div className="flex items-center justify-center gap-2">
//           <button
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={page === 1}
//             className="px-4 py-2 bg-white border border-neutral-300 rounded-lg font-semibold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Previous
//           </button>
//           <span className="px-4 py-2">
//             Page {page} of {Math.ceil(data.total / 20)}
//           </span>
//           <button
//             onClick={() => setPage((p) => p + 1)}
//             disabled={page >= Math.ceil(data.total / 20)}
//             className="px-4 py-2 bg-white border border-neutral-300 rounded-lg font-semibold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
function Farmers() {
  const [page, setPage] = useState(1);
  const { data, loading, error, execute } = useAPI(
    () => clerkAPI.getFarmers(page, 20),
    [page]
  );

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFarmer, setEditFarmer] = useState(null);

  // Delete states
  const [deleteFarmer, setDeleteFarmer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={execute} />;

  const handleSuccess = async () => {
    setIsModalOpen(false);
    setEditFarmer(null);
    await execute(); // refresh farmers list
  };

  const handleDelete = async () => {
    if (!deleteFarmer) return;
    try {
      setDeleting(true);
      setDeleteError("");

      await fetch(`/api/clerk/farmers/${deleteFarmer.id}`, {
        method: "DELETE",
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete farmer");
        }
      });

      setDeleteFarmer(null);
      await execute();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete farmer");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">
            Registered Farmers
          </h3>
          <p className="text-neutral-500">Total: {data?.total || 0} farmers</p>
        </div>
        <button
          onClick={() => {
            setEditFarmer(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add Farmer
        </button>
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Deliveries
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.farmers?.map((farmer, i) => (
                <tr
                  key={i}
                  className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-neutral-800">
                    {farmer.full_name}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{farmer.phone}</td>
                  <td className="px-6 py-4 text-neutral-600">
                    {farmer.location || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    {farmer.total_deliveries || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        farmer.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {farmer.is_active ? (
                        <CheckCircle size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                      {farmer.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditFarmer(farmer);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} className="text-blue-600" />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteFarmer(farmer)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data?.total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-neutral-300 rounded-lg font-semibold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {Math.ceil(data.total / 20)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.total / 20)}
            className="px-4 py-2 bg-white border border-neutral-300 rounded-lg font-semibold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteFarmer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-neutral-600 mb-4">
              Are you sure you want to delete{" "}
              <strong>{deleteFarmer.full_name}</strong>?
            </p>
            {deleteError && (
              <p className="text-red-500 text-sm mb-2">{deleteError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteFarmer(null)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditFarmer(null);
        }}
        onSuccess={handleSuccess}
        editFarmer={editFarmer}
      />
    </div>
  );
}

// Products, Orders, Payouts, Reports, Notifications, Settings components
// These follow the same pattern - I'll create shortened versions

function Products() {
  const { data, loading, error, execute } = useAPI(() =>
    clerkAPI.getProducts()
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const handleSuccess = async () => {
    setIsModalOpen(false);
    setEditProduct(null);
    await execute(); // refresh product list immediately
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;

    try {
      setDeleting(true);
      setDeleteError("");

      await fetch(`/api/clerk/products/${deleteProduct.id}`, {
        method: "DELETE",
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete product");
        }
      });

      // Reset delete state and refresh list
      setDeleteProduct(null);
      await execute();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">
            Products Inventory
          </h3>
          <p className="text-neutral-500">Total: {data?.total || 0} products</p>
        </div>
        <button
          onClick={() => {
            setEditProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.products?.map((product, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 flex items-center justify-center text-6xl">
              🌾
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-xl text-neutral-800">
                  {product.produce_name}
                </h4>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    product.status === "AVAILABLE"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <p className="text-neutral-600 mb-2">
                {product.quantity} {product.unit} available
              </p>
              <p className="text-emerald-600 font-bold text-lg mb-4">
                ${product.price_per_unit}/{product.unit}
              </p>
              <p className="text-sm text-neutral-500 mb-4">
                Farmer: {product.farmer_name}
              </p>

              <div className="flex gap-2">
                {/* Edit Button */}
                <button
                  onClick={() => {
                    setEditProduct(product);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
                >
                  Edit
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteProduct(product)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-neutral-600 mb-4">
              Are you sure you want to delete{" "}
              <strong>{deleteProduct.produce_name}</strong>?
            </p>
            {deleteError && (
              <p className="text-red-500 text-sm mb-2">{deleteError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteProduct(null)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditProduct(null);
        }}
        onSuccess={handleSuccess}
        editProduct={editProduct}
      />
    </div>
  );
}

function Orders() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, loading, error } = useAPI(
    () => clerkAPI.getOrders(statusFilter),
    [statusFilter]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">
            Order Management
          </h3>
          <p className="text-neutral-500">Total: {data?.total || 0} orders</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Orders</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="space-y-4">
        {data?.orders?.map((order, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-lg text-neutral-800">
                    #{order.id.substring(0, 8)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === "FULFILLED"
                        ? "bg-emerald-100 text-emerald-700"
                        : order.status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : order.status === "PAID"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-neutral-600 mb-1">
                  <span className="font-semibold">{order.buyer_name}</span> •{" "}
                  {order.buyer_phone}
                </p>
                <p className="text-sm text-neutral-500">
                  {new Date(order.created_at).toLocaleDateString()} •{" "}
                  {order.items?.length || 0} items
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-neutral-500">Amount</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${order.total_amount}
                  </p>
                </div>
                <button className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Payouts() {
  const { data, loading, error } = useAPI(() => clerkAPI.getPayouts());

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">
            Farmer Payouts
          </h3>
          <p className="text-neutral-500">Total: {data?.total || 0} payouts</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Farmer
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.payouts?.map((payout, i) => (
                <tr
                  key={i}
                  className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-neutral-800">
                    {payout.farmer_name}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    {payout.farmer_phone}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">
                    ${payout.amount}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    {new Date(payout.payment_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        payout.status === "SENT"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {payout.status === "SENT" ? (
                        <CheckCircle size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                      {payout.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Reports() {
  const [reportType, setReportType] = useState("");
  const { data, loading, error } = useAPI(
    () => clerkAPI.getReports(null, null, reportType),
    [reportType]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">
            Reports & Analytics
          </h3>
          <p className="text-neutral-500">
            Hub: {data?.hubName || "Loading..."}
          </p>
        </div>
        <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
          <BarChart3 size={18} />
          Export Report
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 text-center hover:shadow-xl transition-shadow">
          <BarChart3 className="mx-auto text-emerald-600 mb-4" size={48} />
          <h4 className="text-xl font-bold text-neutral-800 mb-2">
            Monthly Revenue
          </h4>
          <p className="text-neutral-600 mb-4">
            Detailed breakdown of earnings
          </p>
          <button
            onClick={() => setReportType("revenue")}
            className="bg-emerald-50 text-emerald-700 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
          >
            View Report
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 text-center hover:shadow-xl transition-shadow">
          <TrendingUp className="mx-auto text-blue-600 mb-4" size={48} />
          <h4 className="text-xl font-bold text-neutral-800 mb-2">
            Sales Trends
          </h4>
          <p className="text-neutral-600 mb-4">Product performance analytics</p>
          <button
            onClick={() => setReportType("sales")}
            className="bg-blue-50 text-blue-700 px-6 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
          >
            View Report
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 text-center hover:shadow-xl transition-shadow">
          <Users className="mx-auto text-purple-600 mb-4" size={48} />
          <h4 className="text-xl font-bold text-neutral-800 mb-2">
            Farmer Activity
          </h4>
          <p className="text-neutral-600 mb-4">
            Registration and delivery stats
          </p>
          <button
            onClick={() => setReportType("farmers")}
            className="bg-purple-50 text-purple-700 px-6 py-2 rounded-lg font-semibold hover:bg-purple-100 transition-colors"
          >
            View Report
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 text-center hover:shadow-xl transition-shadow">
          <Package className="mx-auto text-amber-600 mb-4" size={48} />
          <h4 className="text-xl font-bold text-neutral-800 mb-2">
            Inventory Report
          </h4>
          <p className="text-neutral-600 mb-4">Stock levels and turnover</p>
          <button className="bg-amber-50 text-amber-700 px-6 py-2 rounded-lg font-semibold hover:bg-amber-100 transition-colors">
            View Report
          </button>
        </div>
      </div>

      {/* Display report data if available */}
      {data?.revenue && (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
          <h4 className="text-xl font-bold text-neutral-800 mb-4">
            Revenue Report
          </h4>
          <div className="space-y-3">
            {data.revenue.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
              >
                <span className="font-semibold">
                  {new Date(item.month).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="text-emerald-600 font-bold">
                  ${item.hub_revenue}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const { data, loading, error } = useAPI(() => clerkAPI.getNotifications());
  const { execute: markAsRead } = useAPICall();

  const handleMarkRead = async (notificationId) => {
    try {
      await markAsRead(clerkAPI.markNotificationRead, notificationId);
      window.location.reload();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">Notifications</h3>
          <p className="text-neutral-500">
            {data?.unread || 0} unread notifications
          </p>
        </div>
        <button
          onClick={() => markAsRead(clerkAPI.markAllNotificationsRead)}
          className="text-emerald-600 hover:text-emerald-700 font-semibold"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {data?.notifications?.map((notif, i) => (
          <div
            key={i}
            className={`bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 hover:shadow-xl transition-shadow ${
              !notif.is_read ? "border-l-4 border-l-emerald-500" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-100">
                <Bell className="text-emerald-600" size={20} />
              </div>
              <div className="flex-1">
                <h4
                  className={`${
                    !notif.is_read ? "font-semibold" : "font-medium"
                  } text-neutral-800 mb-1`}
                >
                  {notif.title}
                </h4>
                <p className="text-neutral-600 mb-2">{notif.message}</p>
                <p className="text-sm text-neutral-500">
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>
              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const {
    data: hubData,
    loading,
    error,
  } = useAPI(() => clerkAPI.getHubSettings());
  const { execute: updateSettings, loading: updating } = useAPICall();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (hubData) {
      setFormData({
        name: hubData.name || "",
        location: hubData.location || "",
      });
    }
  }, [hubData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(clerkAPI.updateHubSettings, formData);
      alert("Settings updated successfully!");
    } catch (err) {
      alert("Failed to update settings: " + err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-neutral-800">Hub Settings</h3>
        <p className="text-neutral-500">Manage your hub configuration</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          <h4 className="text-xl font-bold text-neutral-800 mb-6">
            General Information
          </h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Hub Name
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={updating}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {updating && <Loader2 className="animate-spin" size={18} />}
              Save Changes
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
            <h4 className="text-lg font-bold mb-4">Hub Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="text-emerald-100">Manager</span>
                <span className="font-bold">{hubData?.manager_name}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="text-emerald-100">Email</span>
                <span className="font-bold text-sm">
                  {hubData?.manager_email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-100">Phone</span>
                <span className="font-bold">{hubData?.manager_phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
