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
  Copy,
  Send,
  Loader2,
  Eye,
  Calendar,
  Download,
  User,
  FileDown,
  Contact,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { clerkAPI } from "../services/api";
import { useAPI, useAPICall } from "../hooks/useAPI";
import ProductModal from "../components/ProductModal";
import UserModal from "../components/UserModel";
import { Link } from "react-router-dom";

const menuItems = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "farmers", label: "Farmers", icon: Users },
  // { key: "buyers", label: "Buyers", icon: Users },
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
              <h1 className="font-bold text-xl">Hub Dashboard</h1>
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
              <PhoneOutgoing size={20} className="text-neutral-600" />
              {/* <span className="">Contact</span> */}
            </button>
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
          {active === "reports" && <ReportsDashboard />}
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
  const { data: activity } = useAPI(() => clerkAPI.getRecentActivity(4));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const statsData = [
    {
      label: "Total Farmers Delivies",
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
      value: `${stats?.revenue?.toLocaleString() || 0} Rwf`,
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

              <Link> Add New Farmer</Link>
            </button>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl p-3 text-left font-medium transition-all flex items-center gap-3">
              <Package size={18} />
              <Link>Register Product</Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Farmers Component with API Integration

export function Farmers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState(""); // debounced value

  // 🔁 Fetch farmers
  const { data, loading, error, execute } = useAPI(
    () => clerkAPI.getFarmers(page, 20, query),
    [page, query]
  );

  // Debounce search
  useEffect(() => {
    const delay = setTimeout(() => setQuery(search), 400);
    return () => clearTimeout(delay);
  }, [search]);

  // --- Modal and Delete states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFarmer, setEditFarmer] = useState(null);
  const [deleteFarmer, setDeleteFarmer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={execute} />;

  const handleSuccess = async () => {
    setIsModalOpen(false);
    setEditFarmer(null);
    await execute();
  };

  const handleDelete = async () => {
    if (!deleteFarmer) return;
    try {
      setDeleting(true);
      setDeleteError("");
      await clerkAPI.deleteFarmer(deleteFarmer.id);
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

        <div className="flex items-center gap-3">
          {/* 🔍 Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-neutral-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
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

export function Products() {
  const [productsData, setProductsData] = useState({ products: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 12;

  const loadProducts = async (page = 1) => {
    setLoading(true);
    try {
      const data = await clerkAPI.getProducts("AVAILABLE", page, limit);
      setProductsData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(page);
  }, [page]);

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditProduct(null);
    setViewProduct(null);
    loadProducts(page);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const totalPages = Math.ceil(productsData.total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">
            Products Inventory
          </h3>
          <p className="text-neutral-500">
            Total: {productsData.total} products
          </p>
        </div>
        <button
          onClick={() => {
            setEditProduct(null);
            setViewProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {productsData.products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
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
                {product.price_per_unit} Rwf/{product.unit}
              </p>
              <p className="text-sm text-neutral-500 mb-4">
                Farmer: {product.farmer_name}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditProduct(product);
                    setViewProduct(null);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setViewProduct(product);
                    setEditProduct(null);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye size={16} /> Receipt
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditProduct(null);
          setViewProduct(null);
        }}
        onSuccess={handleModalSuccess}
        editProduct={editProduct}
        viewProduct={viewProduct} // 👈 new prop
      />
    </div>
  );
}

//orders
// function Orders() {
//   const [statusFilter, setStatusFilter] = useState("");
//   const [mode, setMode] = useState("LIST"); // LIST | DETAILS
//   const [selectedOrder, setSelectedOrder] = useState(null);

//   const { data, loading, error, refetch } = useAPI(
//     () => clerkAPI.getOrders(statusFilter),
//     [statusFilter]
//   );

//   const handleViewDetails = async (orderId) => {
//     try {
//       const details = await clerkAPI.getOrderDetails(orderId);
//       setSelectedOrder(details);
//       setMode("DETAILS");
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleUpdateStatus = async (orderId, status) => {
//     try {
//       await clerkAPI.updateOrderStatus(orderId, status);
//       alert(`Order status updated to ${status}`);
//       await refetch();
//       setMode("LIST");
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   // --- DETAILS Mode ---
//   if (mode === "DETAILS" && selectedOrder) {
//     return (
//       <div className="p-6 bg-white rounded-2xl shadow-lg space-y-6">
//         <h3 className="text-2xl font-bold">
//           Order #{selectedOrder.id.substring(0, 8)}
//         </h3>
//         <p className="text-neutral-600">
//           Buyer:{" "}
//           <span className="font-semibold">{selectedOrder.buyer_name}</span> •{" "}
//           {selectedOrder.buyer_phone}
//         </p>
//         <p className="text-neutral-600">
//           Hub: {selectedOrder.name || "Ruhango FTH"} (
//           {selectedOrder.hub_location || "South Province"})
//         </p>
//         <p>Status: {selectedOrder.status}</p>
//         <p>Created at: {new Date(selectedOrder.created_at).toLocaleString()}</p>

//         <div className="border-t pt-4 space-y-2">
//           {selectedOrder.items.map((item, idx) => (
//             <div key={idx} className="flex justify-between">
//               <span>
//                 {item.produce_name} × {item.quantity} {item.unit}
//               </span>
//               <span>{(item.unit_price * item.quantity).toFixed(2)} Rwf</span>
//             </div>
//           ))}
//         </div>
//         <hr />
//         <div className="flex justify-between font-bold text-lg">
//           <span>Total</span>
//           <span>{selectedOrder.total_amount} Rwf</span>
//         </div>

//         <div className="flex gap-4 mt-4">
//           {selectedOrder.status === "PENDING" && (
//             <button
//               onClick={() => handleUpdateStatus(selectedOrder.id, "FULFILLED")}
//               className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700"
//             >
//               Mark as Fulfilled
//             </button>
//           )}
//           <button
//             onClick={() => setMode("LIST")}
//             className="px-4 py-2 border rounded-xl hover:cursor-pointer hover:bg-red-700 hover:border-none hover:text-white"
//           >
//             Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // --- LIST Mode ---
//   if (loading) return <LoadingSpinner />;
//   if (error) return <ErrorMessage message={error} />;

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <h3 className="text-2xl font-bold text-neutral-800">
//             Order Management
//           </h3>
//           <p className="text-neutral-500">Total: {data?.total || 0} orders</p>
//         </div>
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
//         >
//           <option value="">All Orders</option>
//           <option value="PENDING">Pending</option>
//           <option value="PAID">Paid</option>
//           <option value="FULFILLED">Fulfilled</option>
//           <option value="CANCELLED">Cancelled</option>
//         </select>
//       </div>

//       <div className="space-y-4">
//         {data?.orders?.map((order, i) => (
//           <div
//             key={i}
//             className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 hover:shadow-xl transition-shadow"
//           >
//             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 mb-2">
//                   <span className="font-bold text-lg text-neutral-800">
//                     #{order.id.substring(0, 8)}
//                   </span>
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                       order.status === "FULFILLED"
//                         ? "bg-emerald-100 text-emerald-700"
//                         : order.status === "PENDING"
//                         ? "bg-amber-100 text-amber-700"
//                         : order.status === "PAID"
//                         ? "bg-blue-100 text-blue-700"
//                         : "bg-red-100 text-red-700"
//                     }`}
//                   >
//                     {order.status}
//                   </span>
//                 </div>
//                 <p className="text-neutral-600 mb-1">
//                   <span className="font-semibold">{order.buyer_name}</span> •{" "}
//                   {order.buyer_phone}
//                 </p>
//                 <p className="text-sm text-neutral-500">
//                   {new Date(order.created_at).toLocaleDateString()} •{" "}
//                   {order.items?.length || 0} items
//                 </p>
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="text-right">
//                   <p className="text-sm text-neutral-500">Amount</p>
//                   <p className="text-2xl font-bold text-emerald-600">
//                     {order.total_amount} Rwf
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => handleViewDetails(order.id)}
//                   className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
//                 >
//                   View Details
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

export function Orders() {
  const [statusFilter, setStatusFilter] = useState("");
  const [mode, setMode] = useState("LIST"); // LIST | DETAILS
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await clerkAPI.getOrders(statusFilter, page, limit);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const handleViewDetails = async (orderId) => {
    try {
      const details = await clerkAPI.getOrderDetails(orderId);
      setSelectedOrder(details);
      setMode("DETAILS");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await clerkAPI.updateOrderStatus(orderId, status);
      alert(`Order status updated to ${status}`);
      await fetchOrders();
      setMode("LIST");
    } catch (err) {
      alert(err.message);
    }
  };

  const totalOrders = data?.total || 0;
  const totalPages = Math.ceil(totalOrders / limit) || 1;

  // --- DETAILS Mode ---
  if (mode === "DETAILS" && selectedOrder) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-lg space-y-6">
        <h3 className="text-2xl font-bold">
          Order #{selectedOrder.id.substring(0, 8)}
        </h3>
        <p className="text-neutral-600">
          Buyer:{" "}
          <span className="font-semibold">{selectedOrder.buyer_name}</span> •{" "}
          {selectedOrder.buyer_phone}
        </p>
        <p className="text-neutral-600">
          Hub: {selectedOrder.name || "Ruhango FTH"} (
          {selectedOrder.hub_location || "South Province"})
        </p>
        <p>Status: {selectedOrder.status}</p>
        <p>Created at: {new Date(selectedOrder.created_at).toLocaleString()}</p>

        <div className="border-t pt-4 space-y-2">
          {selectedOrder.items.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>
                {item.produce_name} × {item.quantity} {item.unit}
              </span>
              <span>{(item.unit_price * item.quantity).toFixed(2)} Rwf</span>
            </div>
          ))}
        </div>
        <hr />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{selectedOrder.total_amount} Rwf</span>
        </div>

        <div className="flex gap-4 mt-4">
          {selectedOrder.status === "PENDING" && (
            <button
              onClick={() => handleUpdateStatus(selectedOrder.id, "FULFILLED")}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700"
            >
              Mark as Fulfilled
            </button>
          )}
          <button
            onClick={() => setMode("LIST")}
            className="px-4 py-2 border rounded-xl hover:bg-red-700 hover:text-white transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // --- LIST Mode ---
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">
            Order Management
          </h3>
          <p className="text-neutral-500">Total: {totalOrders} orders</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1); // reset page on filter change
            setStatusFilter(e.target.value);
          }}
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
                    {order.total_amount} Rwf
                  </p>
                </div>
                <button
                  onClick={() => handleViewDetails(order.id)}
                  className="bg-emerald-600 text-white px-6 py-1.5 rounded-xl font-normal hover:bg-emerald-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

//payout
export function Payouts() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [providerRef, setProviderRef] = useState("");
  const [processing, setProcessing] = useState(false);

  // useAPI hook call with pagination dependency
  const { data, loading, error, refetch } = useAPI(() =>
    clerkAPI.getPayouts(null, page, limit)
  );
  const { execute: processPayout } = useAPICall();

  const totalPayouts = data?.total || 0;
  const totalPages = Math.ceil(totalPayouts / limit) || 1;

  function generateProviderRef(method) {
    const number = Math.floor(100000000 + Math.random() * 900000000);
    const letters = Array.from({ length: 3 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join("");
    return `${method}:${number}-${letters}`;
  }

  function ProviderRefDisplay({ providerRef, setProviderRef }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
      if (!providerRef) {
        const generated = generateProviderRef("MM");
        setProviderRef(generated);
      }
    }, [providerRef, setProviderRef]);

    const handleCopy = () => {
      navigator.clipboard.writeText(providerRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <p className="flex items-center gap-2 mb-2">
        <span>ProviderRef:</span>
        <span className="font-bold select-text">{providerRef}</span>
        <button
          onClick={handleCopy}
          aria-label="Copy ProviderRef"
          className="hover:text-blue-600 transition-colors"
        >
          <Copy size={14} />
        </button>
        {copied && <span className="text-green-600 text-sm">Copied!</span>}
      </p>
    );
  }

  const handleProcess = async () => {
    if (!selectedPayout || !providerRef) {
      toast.error("Please enter a provider reference number");
      return;
    }
    try {
      setProcessing(true);
      await processPayout(clerkAPI.processPayout, selectedPayout.id, {
        providerRef,
      });
      toast.success("Payout marked as SENT");
      setSelectedPayout(null);
      setProviderRef("");
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to process payout");
    } finally {
      setProcessing(false);
    }
  };

  // 🔁 Refetch data when page changes
  useEffect(() => {
    refetch();
  }, [page]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">
            Farmer Payouts
          </h3>
          <p className="text-neutral-500">Total: {totalPayouts} payouts</p>
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
                <th className="px-6 py-4 text-sm font-bold text-neutral-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.payouts?.map((payout) => (
                <tr
                  key={payout.id}
                  className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-neutral-800">
                    {payout.farmer_name}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    {payout.farmer_phone}
                  </td>
                  <td className="px-6 py-4 font-bold text-black">
                    {payout.amount} Rwf
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
                  <td className="px-6 py-4">
                    {payout.status === "PENDING" && (
                      <button
                        onClick={() => setSelectedPayout(payout)}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:shadow-md transition"
                      >
                        <Send size={14} /> Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Process Payout
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Enter provider reference for{" "}
              <span className="font-semibold">
                {selectedPayout.farmer_name}
              </span>
              ’s payout of {selectedPayout.amount} Rwf.
            </p>
            <ProviderRefDisplay
              providerRef={providerRef}
              setProviderRef={setProviderRef}
            />
            <input
              type="text"
              value={providerRef}
              onChange={(e) => setProviderRef(e.target.value)}
              placeholder="Enter Provider Reference"
              className="w-full border rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedPayout(null)}
                className="px-5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProcess}
                disabled={processing}
                className="px-5 py-2 rounded-xl bg-green-700 text-white font-semibold shadow hover:shadow-lg transition disabled:opacity-50"
              >
                {processing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//Report

// export function ReportsDashboard() {
//   const [activeTab, setActiveTab] = useState("revenue");
//   const [data, setData] = useState([]);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [loading, setLoading] = useState(false);

//   const tabs = [
//     { id: "revenue", label: "Revenue Report", icon: <DollarSign size={16} /> },
//     { id: "sales", label: "Sales Report", icon: <Package size={16} /> },
//     { id: "farmers", label: "Farmer Report", icon: <User size={16} /> },
//   ];

//   // ✅ Fetch reports
//   const fetchReports = async () => {
//     setLoading(true);
//     try {
//       const res = await clerkAPI.getReports(startDate, endDate, activeTab);
//       console.log("📊 Report response:", res.data);
//       // simplified to match backend structure
//       setData(res.data?.[activeTab] || []);
//     } catch (err) {
//       console.error("Report fetch error:", err);
//       alert("⚠️ Failed to load report data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReports();
//   }, [activeTab]);

//   // ✅ Totals calculator
//   const getTotals = (data, type) => {
//     if (!data || data.length === 0) return [];
//     if (type === "revenue") {
//       const totalHubRevenue = data.reduce(
//         (s, r) => s + Number(r.hub_revenue || 0),
//         0
//       );
//       const totalFarmerAmount = data.reduce(
//         (s, r) => s + Number(r.farmer_amount || 0),
//         0
//       );
//       const totalTransactions = data.reduce(
//         (s, r) => s + Number(r.transaction_count || 0),
//         0
//       );
//       return [
//         {
//           label: "Total Hub Revenue",
//           value: `${totalHubRevenue.toLocaleString()} Rwf`,
//         },
//         {
//           label: "Total Farmer Amount",
//           value: `${totalFarmerAmount.toLocaleString()} Rwf`,
//         },
//         { label: "Total Transactions", value: totalTransactions },
//       ];
//     }
//     if (type === "sales") {
//       const totalRevenue = data.reduce(
//         (s, r) => s + Number(r.total_revenue || 0),
//         0
//       );
//       const totalOrders = data.reduce(
//         (s, r) => s + Number(r.order_count || 0),
//         0
//       );
//       return [
//         {
//           label: "Total Sales Revenue",
//           value: `${totalRevenue.toLocaleString()} Rwf`,
//         },
//         { label: "Orders Processed", value: totalOrders },
//       ];
//     }
//     if (type === "farmers") {
//       const totalEarned = data.reduce(
//         (s, r) => s + Number(r.total_earned || 0),
//         0
//       );
//       return [
//         {
//           label: "Total Paid to Farmers",
//           value: `${totalEarned.toLocaleString()} Rwf`,
//         },
//       ];
//     }
//     return [];
//   };

//   const totals = getTotals(data, activeTab);

//   // ✅ Export functions
//   const handleExport = (format) => {
//     if (!data || data.length === 0) return alert("No data to export");
//     try {
//       if (format === "csv") {
//         const headers = Object.keys(data[0]);
//         const csvRows = [
//           headers.join(","),
//           ...data.map((row) =>
//             headers.map((f) => JSON.stringify(row[f] ?? "")).join(",")
//           ),
//         ];
//         const blob = new Blob([csvRows.join("\n")], {
//           type: "text/csv;charset=utf-8;",
//         });
//         const link = document.createElement("a");
//         link.href = URL.createObjectURL(blob);
//         link.download = `${activeTab}_report.csv`;
//         link.click();
//       } else if (format === "xlsx") {
//         const ws = XLSX.utils.json_to_sheet(data);
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Report");
//         XLSX.writeFile(wb, `${activeTab}_report.xlsx`);
//       } else if (format === "pdf") {
//         const element = document.getElementById("report-content");
//         if (!element) return alert("⚠️ Report not ready for PDF export");
//         html2canvas(element, {
//           scale: 2,
//           backgroundColor: "#ffffff",
//           useCORS: true,
//         }).then((canvas) => {
//           const imgData = canvas.toDataURL("image/png");
//           const pdf = new jsPDF("p", "mm", "a4");
//           const pdfWidth = pdf.internal.pageSize.getWidth();
//           const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
//           pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//           pdf.save(`${activeTab}_report.pdf`);
//         });
//       }
//     } catch (err) {
//       console.error("Export error:", err);
//       alert("⚠️ Export failed. Please try again.");
//     }
//   };

//   // ✅ Small reusable button
//   const CustomButton = ({ children, onClick, color }) => (
//     <button
//       onClick={onClick}
//       className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 transition-all ${
//         color === "green"
//           ? "bg-emerald-600 hover:bg-emerald-700"
//           : color === "blue"
//           ? "bg-blue-600 hover:bg-blue-700"
//           : "bg-amber-500 hover:bg-amber-600"
//       }`}
//     >
//       {children}
//     </button>
//   );

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex flex-wrap justify-between items-center mb-6">
//         <h1 className="text-2xl font-semibold text-emerald-700">
//           Reports Dashboard
//         </h1>
//         <div className="flex flex-wrap gap-2 items-center">
//           <div className="flex border-b">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-1 px-4 py-2 rounded-t-md transition-all ${
//                   activeTab === tab.id
//                     ? "bg-emerald-600 text-white"
//                     : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//                 }`}
//               >
//                 {tab.icon}
//                 {tab.label}
//               </button>
//             ))}
//           </div>

//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="border border-gray-300 rounded-md px-2 py-1 text-sm"
//           />
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="border border-gray-300 rounded-md px-2 py-1 text-sm"
//           />
//           <CustomButton color="green" onClick={fetchReports}>
//             Apply
//           </CustomButton>
//           <CustomButton color="green" onClick={() => handleExport("pdf")}>
//             <FileDown size={16} /> PDF
//           </CustomButton>
//           <CustomButton color="blue" onClick={() => handleExport("csv")}>
//             <FileDown size={16} /> CSV
//           </CustomButton>
//           <CustomButton color="amber" onClick={() => handleExport("xlsx")}>
//             <FileDown size={16} /> Excel
//           </CustomButton>
//         </div>
//       </div>

//       {/* Report content */}
//       <div
//         id="report-content"
//         className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
//       >
//         {loading ? (
//           <p className="text-center text-gray-400">Loading...</p>
//         ) : (
//           <>
//             {/* Totals summary */}
//             <div className="grid md:grid-cols-3 gap-4 mb-6">
//               {totals.map((item, idx) => (
//                 <div
//                   key={idx}
//                   className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 shadow-sm"
//                 >
//                   <p className="text-sm text-gray-600">{item.label}</p>
//                   <p className="text-xl font-semibold text-emerald-700 mt-1">
//                     {item.value}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             {/* Charts Section */}
//             {Array.isArray(data) && data.length > 0 && (
//               <motion.div
//                 initial={{ opacity: 0, y: 15 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4 }}
//                 className="bg-white border border-emerald-100 rounded-lg shadow-sm p-4 mb-6"
//               >
//                 <h2 className="text-lg font-semibold text-emerald-700 mb-3">
//                   {activeTab === "revenue"
//                     ? "Revenue Trends"
//                     : activeTab === "sales"
//                     ? "Sales Overview"
//                     : "Farmers Statistics"}
//                 </h2>

//                 <ResponsiveContainer width="100%" height={350}>
//                   {activeTab === "revenue" && (
//                     <LineChart data={data}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis
//                         dataKey="month"
//                         tickFormatter={(v) =>
//                           new Date(v).toLocaleDateString("en-GB", {
//                             month: "short",
//                             day: "numeric",
//                           })
//                         }
//                       />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       <Line
//                         type="monotone"
//                         dataKey="hub_revenue"
//                         stroke="#10B981"
//                         strokeWidth={2}
//                         name="Hub Revenue"
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="farmer_amount"
//                         stroke="#3B82F6"
//                         strokeWidth={2}
//                         name="Farmer Amount"
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="total_amount"
//                         stroke="#F59E0B"
//                         strokeWidth={2}
//                         name="Total Revenue"
//                       />
//                     </LineChart>
//                   )}

//                   {activeTab === "sales" && (
//                     <BarChart data={data}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="product_name" />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       <Bar
//                         dataKey="total_revenue"
//                         fill="#10B981"
//                         name="Total Revenue"
//                       />
//                       <Bar
//                         dataKey="total_quantity"
//                         fill="#3B82F6"
//                         name="Quantity Sold"
//                       />
//                     </BarChart>
//                   )}

//                   {activeTab === "farmers" && (
//                     <BarChart data={data}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="farmer_name" />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       <Bar
//                         dataKey="total_earned"
//                         fill="#10B981"
//                         name="Total Earned (Rwf)"
//                       />
//                       <Bar
//                         dataKey="total_deliveries"
//                         fill="#3B82F6"
//                         name="Deliveries"
//                       />
//                     </BarChart>
//                   )}
//                 </ResponsiveContainer>
//               </motion.div>
//             )}

//             {/* Table */}
//             {Array.isArray(data) && data.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full border text-sm">
//                   <thead className="bg-emerald-50">
//                     <tr>
//                       {Object.keys(data[0]).map((key) => (
//                         <th
//                           key={key}
//                           className="px-4 py-2 border-b text-left font-semibold text-gray-700"
//                         >
//                           {key.replace(/_/g, " ").toUpperCase()}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {data.map((row, i) => (
//                       <tr key={i} className="hover:bg-emerald-50">
//                         {Object.values(row).map((val, j) => (
//                           <td key={j} className="px-4 py-2 border-b">
//                             {val}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <p className="text-center text-gray-400">
//                 No data available for this period.
//               </p>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

export function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "revenue", label: "Revenue Report", icon: <DollarSign size={16} /> },
    { id: "sales", label: "Sales Report", icon: <Package size={16} /> },
    { id: "farmers", label: "Farmer Report", icon: <User size={16} /> },
  ];

  // ✅ Fetch reports from backend
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await clerkAPI.getReports(startDate, endDate, activeTab);
      console.log("📊 Report response:", res.data);
      // Backend: res.data.data contains all tabs
      const extracted = res.data?.[activeTab] || [];

      setData(extracted);
    } catch (err) {
      console.error("Report fetch error:", err);
      alert("⚠️ Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  // ✅ Compute totals
  const getTotals = (type) => {
    if (!data?.length) return [];

    switch (type) {
      case "revenue": {
        const totalHub = data.reduce(
          (s, r) => s + Number(r.hub_revenue || 0),
          0
        );
        const totalFarmer = data.reduce(
          (s, r) => s + Number(r.farmer_amount || 0),
          0
        );
        const totalTx = data.reduce(
          (s, r) => s + Number(r.transaction_count || 0),
          0
        );
        return [
          {
            label: "Total Hub Revenue",
            value: `${totalHub.toLocaleString()} Rwf`,
          },
          {
            label: "Total Farmer Amount",
            value: `${totalFarmer.toLocaleString()} Rwf`,
          },
          { label: "Transactions", value: totalTx },
        ];
      }
      case "sales": {
        const totalRevenue = data.reduce(
          (s, r) => s + Number(r.total_revenue || 0),
          0
        );
        const totalOrders = data.reduce(
          (s, r) => s + Number(r.order_count || 0),
          0
        );
        return [
          {
            label: "Sales Revenue",
            value: `${totalRevenue.toLocaleString()} Rwf`,
          },
          { label: "Orders", value: totalOrders },
        ];
      }
      case "farmers": {
        const totalEarned = data.reduce(
          (s, r) => s + Number(r.total_earned || 0),
          0
        );
        return [
          {
            label: "Total Paid to Farmers",
            value: `${totalEarned.toLocaleString()} Rwf`,
          },
        ];
      }
      default:
        return [];
    }
  };

  const totals = getTotals(activeTab);

  // ✅ Export handlers
  const handleExport = (format) => {
    if (!data.length) return alert("No data to export");

    try {
      if (format === "csv") {
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(","),
          ...data.map((r) =>
            headers.map((f) => JSON.stringify(r[f] ?? "")).join(",")
          ),
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${activeTab}_report.csv`;
        link.click();
      } else if (format === "xlsx") {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${activeTab}_report.xlsx`);
      } else if (format === "pdf") {
        const element = document.getElementById("report-content");
        html2canvas(element, { scale: 2 }).then((canvas) => {
          const pdf = new jsPDF("p", "mm", "a4");
          const imgData = canvas.toDataURL("image/png");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${activeTab}_report.pdf`);
        });
      }
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed. Try again.");
    }
  };

  const CustomButton = ({ onClick, color, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 transition-all ${
        color === "green"
          ? "bg-emerald-600 hover:bg-emerald-700"
          : color === "blue"
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-amber-500 hover:bg-amber-600"
      }`}
    >
      {children}
    </button>
  );

  // ✅ Formatters
  const formatDate = (val) =>
    new Date(val).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    });

  // ✅ Chart builder
  const renderChart = () => {
    if (!data.length) return null;

    switch (activeTab) {
      case "revenue":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickFormatter={formatDate} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="hub_revenue"
              stroke="#10B981"
              name="Hub Revenue"
            />
            <Line
              type="monotone"
              dataKey="farmer_amount"
              stroke="#3B82F6"
              name="Farmer Amount"
            />
            <Line
              type="monotone"
              dataKey="total_amount"
              stroke="#F59E0B"
              name="Total Revenue"
            />
          </LineChart>
        );

      case "sales":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="produce_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_revenue" fill="#10B981" name="Total Revenue" />
            <Bar dataKey="total_quantity" fill="#3B82F6" name="Quantity Sold" />
          </BarChart>
        );

      case "farmers":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="full_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_earned" fill="#10B981" name="Total Earned" />
            <Bar dataKey="total_deliveries" fill="#3B82F6" name="Deliveries" />
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-emerald-700">
          Reports Dashboard
        </h1>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-4 py-2 rounded-t-md transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          />

          <CustomButton color="green" onClick={fetchReports}>
            Apply
          </CustomButton>
          <CustomButton color="green" onClick={() => handleExport("pdf")}>
            <FileDown size={16} /> PDF
          </CustomButton>
          <CustomButton color="blue" onClick={() => handleExport("csv")}>
            <FileDown size={16} /> CSV
          </CustomButton>
          <CustomButton color="amber" onClick={() => handleExport("xlsx")}>
            <FileDown size={16} /> Excel
          </CustomButton>
        </div>
      </div>

      {/* Report Content */}
      <div
        id="report-content"
        className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
      >
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : (
          <>
            {/* Totals Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {totals.map((item, i) => (
                <div
                  key={i}
                  className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 shadow-sm"
                >
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-xl font-semibold text-emerald-700 mt-1">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts */}
            {data.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white border border-emerald-100 rounded-lg shadow-sm p-4 mb-6"
              >
                <h2 className="text-lg font-semibold text-emerald-700 mb-3">
                  {activeTab === "revenue"
                    ? "Revenue Trends"
                    : activeTab === "sales"
                    ? "Sales Overview"
                    : "Farmers Statistics"}
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  {renderChart()}
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Data Table */}
            {data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-emerald-50">
                    <tr>
                      {Object.keys(data[0]).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2 border-b text-left font-semibold text-gray-700"
                        >
                          {key.replace(/_/g, " ").toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={i} className="hover:bg-emerald-50">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-2 border-b">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-400">
                No data available for this period.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Tabs Configuration
const tabs = [
  {
    id: "revenue",
    label: "Revenue Report",
    icon: <BarChart3 size={18} />,
  },
  {
    id: "sales",
    label: "Sales Report",
    icon: <TrendingUp size={18} />,
  },
  {
    id: "farmers",
    label: "Farmer Report",
    icon: <Users size={18} />,
  },
];

// Helper for Aggregation Totals
function getTotals(data, type) {
  if (!data || !data.length) return [];
  if (type === "revenue") {
    const total = data.reduce((s, r) => s + Number(r.total_amount || 0), 0);
    const hubRev = data.reduce((s, r) => s + Number(r.hub_revenue || 0), 0);
    const tx = data.reduce((s, r) => s + Number(r.transaction_count || 0), 0);
    return [
      { label: "Total Transactions", value: tx.toLocaleString() },
      { label: "Total Hub Revenue", value: `${hubRev.toLocaleString()} Rwf` },
      { label: "Total Sales", value: `${total.toLocaleString()} Rwf` },
    ];
  } else if (type === "sales") {
    const totalQty = data.reduce(
      (s, r) => s + Number(r.total_quantity || 0),
      0
    );
    const totalRev = data.reduce((s, r) => s + Number(r.total_revenue || 0), 0);
    return [
      { label: "Products Sold", value: data.length.toLocaleString() },
      { label: "Total Quantity", value: totalQty.toLocaleString() },
      { label: "Total Revenue", value: `${totalRev.toLocaleString()} Rwf` },
    ];
  } else if (type === "farmers") {
    const farmers = data.length;
    const deliveries = data.reduce(
      (s, r) => s + Number(r.total_deliveries || 0),
      0
    );
    const earned = data.reduce((s, r) => s + Number(r.total_earned || 0), 0);
    return [
      { label: "Active Farmers", value: farmers.toLocaleString() },
      { label: "Deliveries", value: deliveries.toLocaleString() },
      { label: "Total Earnings", value: `${earned.toLocaleString()} Rwf` },
    ];
  }
  return [];
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
                Hub Name:
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border font-bold border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Location:
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full font-bold border border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                readOnly
              />
            </div>
            {/* <button
              type="submit"
              disabled={updating}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {updating && <Loader2 className="animate-spin" size={18} />}
              Save Changes
            </button> */}
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
            <h4 className="text-lg font-bold mb-4">Hub Information</h4>
            <div className="space-y-3">
              <div className="block items-center justify-between pb-3 border-b border-white/20">
                <span className="text-emerald-100">Manager Name</span> <br />
                <span className="font-bold">{hubData?.manager_name}</span>
              </div>
              <div className="block items-center justify-between pb-3 border-b border-white/20">
                <span className="text-emerald-100">Email</span> <br />
                <span className="font-bold text-sm">
                  {hubData?.manager_email}
                </span>
              </div>
              <div className="block items-center justify-between">
                <span className="text-emerald-100">Phone</span> <br />
                <span className="font-bold">{hubData?.manager_phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
