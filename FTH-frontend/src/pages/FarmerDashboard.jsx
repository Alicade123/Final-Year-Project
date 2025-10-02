// src/pages/FarmerDashboard.jsx
import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  Loader2,
  AlertCircle,
  Plus,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Sprout,
  BarChart3,
  History,
  ShoppingBag,
} from "lucide-react";
import { useAPI, useAPICall } from "../hooks/useAPI";
import farmerAPI from "../services/farmerAPI";

const menuItems = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", label: "My Products", icon: Package },
  { key: "deliveries", label: "Deliveries", icon: ShoppingBag },
  { key: "earnings", label: "Earnings", icon: DollarSign },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "market", label: "Market Prices", icon: TrendingUp },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function FarmerDashboard() {
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
      <aside className="hidden lg:flex w-72 bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 text-white flex-col shadow-2xl">
        <div className="p-6 border-b border-green-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sprout className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl">Farmer Portal</h1>
              <p className="text-green-300 text-xs">Sell Your Harvest</p>
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
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg scale-105"
                    : "hover:bg-green-700/50 text-green-100"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-white"
                      : "text-green-300 group-hover:text-white"
                  }
                />
                <span className={isActive ? "text-white" : ""}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-green-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-green-100 hover:bg-red-900/50 transition-all"
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
            className="w-72 bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 text-white h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-green-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sprout className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="font-bold text-xl">Farmer Portal</h1>
                  <p className="text-green-300 text-xs">Sell Your Harvest</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-green-300 hover:text-white"
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
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg"
                        : "hover:bg-green-700/50 text-green-100"
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
              className="lg:hidden text-neutral-600 hover:text-green-600"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 capitalize">
                {active}
              </h2>
              <p className="text-sm text-neutral-500">
                Track your farm sales and earnings
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
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
              />
            </div>

            <button className="relative p-2 hover:bg-neutral-100 rounded-xl transition-colors">
              <Bell size={20} className="text-neutral-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-neutral-800">
                  Farmer Account
                </p>
                <p className="text-xs text-neutral-500">Active Seller</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                FA
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <section className="flex-1 p-6 overflow-y-auto">
          {active === "overview" && <Overview />}
          {active === "products" && <MyProducts />}
          {active === "deliveries" && <Deliveries />}
          {active === "earnings" && <Earnings />}
          {active === "analytics" && <Analytics />}
          {active === "market" && <MarketPrices />}
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
      <Loader2 className="animate-spin text-green-600" size={48} />
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

// Overview Component
function Overview() {
  const {
    data: stats,
    loading,
    error,
    refetch,
  } = useAPI(() => farmerAPI.getDashboardStats());

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const statsData = [
    {
      label: "Total Deliveries",
      value: stats?.totalDeliveries || 0,
      change: "+5%",
      icon: Package,
      color: "green",
      subtitle: "All time",
    },
    {
      label: "Available Products",
      value: stats?.availableProducts || 0,
      change: `${stats?.availableQuantity?.toFixed(1) || 0} Kg`,
      icon: ShoppingBag,
      color: "emerald",
      subtitle: "In stock",
    },
    {
      label: "Sold Products",
      value: stats?.soldProducts || 0,
      change: `${stats?.soldQuantity?.toFixed(1) || 0} Kg`,
      icon: CheckCircle,
      color: "blue",
      subtitle: "Total sold",
    },
    {
      label: "Total Earnings",
      value: `$${stats?.totalEarnings?.toFixed(2) || 0}`,
      change: `$${stats?.pendingEarnings?.toFixed(2) || 0} pending`,
      icon: DollarSign,
      color: "amber",
      subtitle: "All time",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => {
          const Icon = stat.icon;
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
              </div>
              <h3 className="text-3xl font-bold text-neutral-800 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-neutral-500 mb-1">{stat.label}</p>
              <p className="text-xs text-green-600 font-semibold">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions and Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
          <h3 className="text-xl font-bold text-neutral-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActive("deliveries")}
              className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all text-left"
            >
              <Plus className="text-green-600 mb-3" size={32} />
              <h4 className="font-bold text-neutral-800">New Delivery</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Register new products
              </p>
            </button>
            <button
              onClick={() => setActive("earnings")}
              className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all text-left"
            >
              <DollarSign className="text-amber-600 mb-3" size={32} />
              <h4 className="font-bold text-neutral-800">View Earnings</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Check your payouts
              </p>
            </button>
            <button
              onClick={() => setActive("market")}
              className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all text-left"
            >
              <TrendingUp className="text-blue-600 mb-3" size={32} />
              <h4 className="font-bold text-neutral-800">Market Prices</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Check current rates
              </p>
            </button>
            <button
              onClick={() => setActive("analytics")}
              className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all text-left"
            >
              <BarChart3 className="text-purple-600 mb-3" size={32} />
              <h4 className="font-bold text-neutral-800">Analytics</h4>
              <p className="text-sm text-neutral-600 mt-1">View performance</p>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Account Summary</h3>
          <div className="space-y-3">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <p className="text-sm text-green-100">Pending Earnings</p>
              <p className="text-2xl font-bold">
                ${stats?.pendingEarnings?.toFixed(2) || 0}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <p className="text-sm text-green-100">Active Products</p>
              <p className="text-2xl font-bold">
                {stats?.availableProducts || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// My Products Component
function MyProducts() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, loading, error } = useAPI(
    () => farmerAPI.getMyProducts(statusFilter),
    [statusFilter]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">My Products</h3>
          <p className="text-neutral-500">Total: {data?.total || 0} products</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="SOLD">Sold</option>
          <option value="RESERVED">Reserved</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.products?.map((product, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 flex items-center justify-center text-6xl">
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
                      ? "bg-green-100 text-green-700"
                      : product.status === "SOLD"
                      ? "bg-blue-100 text-blue-700"
                      : product.status === "RESERVED"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <p className="text-neutral-600 text-sm mb-2">
                {product.category}
              </p>
              <p className="text-neutral-500 text-sm mb-3 flex items-center gap-1">
                <MapPin size={14} />
                {product.hub_name}
              </p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-neutral-600">
                  {product.quantity} {product.unit}
                </span>
                <span className="text-green-600 font-bold text-xl">
                  ${product.price_per_unit}/{product.unit}
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                Lot: {product.lot_code}
              </p>
              <p className="text-xs text-neutral-400 mt-2">
                Posted: {new Date(product.posted_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Deliveries Component with Registration Form
function Deliveries() {
  const [showForm, setShowForm] = useState(false);
  const {
    data: history,
    loading,
    error,
  } = useAPI(() => farmerAPI.getDeliveryHistory());

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">
            Delivery History
          </h3>
          <p className="text-neutral-500">Track all your product deliveries</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          New Delivery
        </button>
      </div>

      {/* Delivery History List */}
      <div className="space-y-4">
        {history?.deliveries?.map((delivery, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-lg text-neutral-800">
                    {delivery.produce_name}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      delivery.status === "SOLD"
                        ? "bg-blue-100 text-blue-700"
                        : delivery.status === "AVAILABLE"
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {delivery.status}
                  </span>
                </div>
                <p className="text-neutral-600 mb-1">
                  {delivery.quantity} {delivery.unit} • $
                  {delivery.price_per_unit}/{delivery.unit}
                </p>
                <p className="text-sm text-neutral-500 flex items-center gap-2">
                  <MapPin size={14} />
                  {delivery.hub_name}
                  <Calendar size={14} className="ml-2" />
                  {new Date(delivery.posted_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(delivery.quantity * delivery.price_per_unit).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Modal */}
      {showForm && (
        <DeliveryRegistrationModal onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

// Delivery Registration Modal
function DeliveryRegistrationModal({ onClose }) {
  const [formData, setFormData] = useState({
    hubId: "",
    produceName: "",
    category: "",
    quantity: "",
    unit: "Kg",
    pricePerUnit: "",
    expiryDate: "",
    notes: "",
  });
  const { execute, loading } = useAPICall();
  const { data: hubs } = useAPI(() => farmerAPI.getAvailableHubs());

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await execute(farmerAPI.requestDelivery, formData);
      alert("Delivery registered successfully!");
      onClose();
      window.location.reload();
    } catch (error) {
      alert("Failed to register delivery: " + error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Register New Delivery
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Hub <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.hubId}
                  onChange={(e) =>
                    setFormData({ ...formData, hubId: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select a hub...</option>
                  {hubs?.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.produceName}
                  onChange={(e) =>
                    setFormData({ ...formData, produceName: e.target.value })
                  }
                  placeholder="e.g., Maize"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select category...</option>
                  <option value="Grains">Grains</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Legumes">Legumes</option>
                  <option value="Tubers">Tubers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="Kg">Kilogram (Kg)</option>
                  <option value="Ton">Ton</option>
                  <option value="Bag">Bag</option>
                  <option value="Crate">Crate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Price Per Unit ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerUnit: e.target.value })
                  }
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any additional information..."
                  rows="3"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            {formData.quantity && formData.pricePerUnit && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700 font-medium">
                    Total Value:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    $
                    {(
                      parseFloat(formData.quantity) *
                      parseFloat(formData.pricePerUnit)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Plus size={20} />
                )}
                {loading ? "Registering..." : "Register Delivery"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Earnings Component
function Earnings() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, loading, error } = useAPI(
    () => farmerAPI.getPayouts(statusFilter),
    [statusFilter]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">My Earnings</h3>
          <p className="text-neutral-500">Total: {data?.total || 0} payouts</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Payouts</option>
          <option value="PENDING">Pending</option>
          <option value="SENT">Sent</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.payouts?.map((payout, i) => (
                <tr
                  key={i}
                  className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-4 text-neutral-600">
                    {new Date(payout.payment_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">
                    ${payout.amount}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    #{payout.order_id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        payout.status === "SENT"
                          ? "bg-green-100 text-green-700"
                          : payout.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
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
                  <td className="px-6 py-4 text-neutral-600 text-sm">
                    {payout.provider_ref || "N/A"}
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

// Analytics Component
function Analytics() {
  const { data, loading, error } = useAPI(() =>
    farmerAPI.getEarningsAnalytics()
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-neutral-800">
          Earnings Analytics
        </h3>
        <p className="text-neutral-500">Performance insights and trends</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Earnings */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
          <h4 className="text-xl font-bold text-neutral-800 mb-4">
            Monthly Earnings
          </h4>
          <div className="space-y-3">
            {data?.monthlyEarnings?.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
              >
                <span className="font-semibold">
                  {new Date(item.month).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    ${item.total_earned}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {item.payout_count} payouts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
          <h4 className="text-xl font-bold text-neutral-800 mb-4">
            Top Products
          </h4>
          <div className="space-y-3">
            {data?.productPerformance?.slice(0, 5).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-neutral-800">
                    {item.produce_name}
                  </p>
                  <p className="text-sm text-neutral-500">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">
                    ${item.total_revenue}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {item.total_delivered} {item.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hub Breakdown */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
          <h4 className="text-xl font-bold text-neutral-800 mb-4">
            Hub Performance
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {data?.hubBreakdown?.map((hub, i) => (
              <div
                key={i}
                className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-green-200"
              >
                <h5 className="font-bold text-neutral-800 mb-2">
                  {hub.hub_name}
                </h5>
                <p className="text-sm text-neutral-600 mb-3">{hub.location}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-neutral-500">Deliveries</p>
                    <p className="text-lg font-bold text-green-600">
                      {hub.delivery_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Sold</p>
                    <p className="text-lg font-bold text-blue-600">
                      {hub.sold_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Total Qty</p>
                    <p className="text-lg font-bold text-purple-600">
                      {hub.total_quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Market Prices Component
function MarketPrices() {
  const { data, loading, error } = useAPI(() => farmerAPI.getMarketPrices());

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-neutral-800">Market Prices</h3>
        <p className="text-neutral-500">
          Current market rates for informed pricing decisions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((price, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-xl text-neutral-800">
                  {price.produce_name}
                </h4>
                <p className="text-sm text-neutral-500">{price.category}</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                {price.sample_count} samples
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-neutral-600">Average</span>
                <span className="text-lg font-bold text-green-600">
                  ${price.avg_price}/{price.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center p-2 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500">Min</p>
                  <p className="font-semibold text-neutral-700">
                    ${price.min_price}
                  </p>
                </div>
                <div className="w-4"></div>
                <div className="flex-1 text-center p-2 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500">Max</p>
                  <p className="font-semibold text-neutral-700">
                    ${price.max_price}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Prices are based on recent market data (last 30
          days). Use these as reference for competitive pricing.
        </p>
      </div>
    </div>
  );
}

// Notifications Component
function Notifications() {
  const { data, loading, error } = useAPI(() => farmerAPI.getNotifications());

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
      </div>

      <div className="space-y-3">
        {data?.notifications?.map((notif, i) => (
          <div
            key={i}
            className={`bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 hover:shadow-xl transition-shadow ${
              !notif.is_read ? "border-l-4 border-l-green-500" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <Bell className="text-green-600" size={20} />
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
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Settings Component
function SettingsTab() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-neutral-800">
          Account Settings
        </h3>
        <p className="text-neutral-500">Manage your farmer account</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          <h4 className="text-xl font-bold text-neutral-800 mb-6">
            Personal Information
          </h4>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <h4 className="text-lg font-bold mb-4">Account Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="text-green-100">Member Since</span>
                <span className="font-bold">Jan 2025</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="text-green-100">Total Products</span>
                <span className="font-bold">45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-100">Status</span>
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle size={16} />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
