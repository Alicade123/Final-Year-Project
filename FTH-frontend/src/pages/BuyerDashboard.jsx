// src/pages/BuyerDashboard.jsx
import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  History,
  Bell,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useAPI, useAPICall } from "../hooks/useAPI";
import { buyerAPI } from "../services/api";
const menuItems = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "marketplace", label: "Marketplace", icon: ShoppingCart },
  { key: "orders", label: "My Orders", icon: Package },
  { key: "history", label: "Purchase History", icon: History },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function BuyerDashboard() {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const addToCart = (product, quantity) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex-col shadow-2xl">
        <div className="p-6 border-b border-blue-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl">Buyer Portal</h1>
              <p className="text-blue-300 text-xs">Shop Fresh Produce</p>
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
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg scale-105"
                    : "hover:bg-blue-700/50 text-blue-100"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-white"
                      : "text-blue-300 group-hover:text-white"
                  }
                />
                <span className={isActive ? "text-white" : ""}>
                  {item.label}
                </span>
                {item.key === "marketplace" && cart.length > 0 && (
                  <span className="ml-auto w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-blue-100 hover:bg-red-900/50 transition-all"
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
            className="w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-blue-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="font-bold text-xl">Buyer Portal</h1>
                  <p className="text-blue-300 text-xs">Shop Fresh Produce</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-blue-300 hover:text-white"
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
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
                        : "hover:bg-blue-700/50 text-blue-100"
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
              className="lg:hidden text-neutral-600 hover:text-blue-600"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 capitalize">
                {active}
              </h2>
              <p className="text-sm text-neutral-500">
                Browse and purchase fresh produce
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
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            <button className="relative p-2 hover:bg-neutral-100 rounded-xl transition-colors">
              <Bell size={20} className="text-neutral-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-neutral-800">
                  Buyer Account
                </p>
                <p className="text-xs text-neutral-500">Regular Customer</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                BA
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <section className="flex-1 p-6 overflow-y-auto">
          {active === "overview" && <Overview />}
          {active === "marketplace" && (
            <Marketplace
              cart={cart}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
              clearCart={clearCart}
            />
          )}
          {active === "orders" && <Orders />}
          {active === "history" && <PurchaseHistory />}
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
      <Loader2 className="animate-spin text-blue-600" size={48} />
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
  } = useAPI(() => buyerAPI.getDashboardStats());

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const statsData = [
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      change: "+8%",
      icon: ShoppingCart,
      color: "blue",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders || 0,
      change: "-2%",
      icon: Clock,
      color: "amber",
    },
    {
      label: "Completed",
      value: stats?.completedOrders || 0,
      change: "+15%",
      icon: CheckCircle,
      color: "emerald",
    },
    {
      label: "Monthly Spent",
      value: `$${stats?.monthlySpent?.toFixed(2) || 0}`,
      change: "+12%",
      icon: DollarSign,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
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
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
          <h3 className="text-xl font-bold text-neutral-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all text-left">
              <ShoppingCart className="text-blue-600 mb-3" size={32} />
              <h4 className="font-bold text-neutral-800">Browse Products</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Explore marketplace
              </p>
            </button>
            <button className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 transition-all text-left">
              <Package className="text-emerald-600 mb-3" size={32} />
              <h4 className="font-bold text-neutral-800">My Orders</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Track your purchases
              </p>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Featured</h3>
          <div className="space-y-3">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <p className="text-sm text-blue-100">Fresh Tomatoes</p>
              <p className="text-2xl font-bold">$0.80/Kg</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <p className="text-sm text-blue-100">Maize - Premium</p>
              <p className="text-2xl font-bold">$1.20/Kg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Marketplace Component
function Marketplace({
  cart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
}) {
  const [filters, setFilters] = useState({
    category: "",
    hubId: "",
    search: "",
  });
  const [showCart, setShowCart] = useState(false);
  const { data, loading, error } = useAPI(
    () => buyerAPI.browseProducts(filters),
    [filters]
  );
  const { data: hubs } = useAPI(() => buyerAPI.getHubs());
  const { data: categories } = useAPI(() => buyerAPI.getCategories());

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price_per_unit * item.quantity,
    0
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
        <div className="flex items-center gap-4 mb-4">
          <Filter size={20} className="text-neutral-600" />
          <h3 className="text-lg font-bold text-neutral-800">Filters</h3>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.count})
              </option>
            ))}
          </select>
          <select
            value={filters.hubId}
            onChange={(e) => setFilters({ ...filters, hubId: e.target.value })}
            className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Hubs</option>
            {hubs?.map((hub) => (
              <option key={hub.id} value={hub.id}>
                {hub.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowCart(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Cart ({cart.length})
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.products?.map((product, i) => (
          <ProductCard key={i} product={product} onAddToCart={addToCart} />
        ))}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
          onClear={clearCart}
          total={cartTotal}
        />
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 flex items-center justify-center text-6xl">
        🌾
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-bold text-xl text-neutral-800">
            {product.produce_name}
          </h4>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
            {product.status}
          </span>
        </div>
        <p className="text-neutral-600 text-sm mb-2">{product.category}</p>
        <p className="text-neutral-500 text-sm mb-3 flex items-center gap-1">
          <MapPin size={14} />
          {product.hub_name}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-neutral-600">
            {product.quantity} {product.unit} available
          </span>
        </div>
        <p className="text-blue-600 font-bold text-2xl mb-4">
          ${product.price_per_unit}/{product.unit}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 bg-neutral-100 rounded-lg hover:bg-neutral-200"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-16 text-center border border-neutral-300 rounded-lg py-2"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-2 bg-neutral-100 rounded-lg hover:bg-neutral-200"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={() => onAddToCart(product, quantity)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// Cart Modal Component
function CartModal({
  cart,
  onClose,
  onUpdateQuantity,
  onRemove,
  onClear,
  total,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart
                className="mx-auto text-neutral-300 mb-4"
                size={64}
              />
              <p className="text-neutral-600">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-800">
                      {item.produce_name}
                    </h4>
                    <p className="text-sm text-neutral-600">
                      ${item.price_per_unit}/{item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1 bg-neutral-200 rounded"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 bg-neutral-200 rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      ${(item.price_per_unit * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold text-neutral-800">Total:</span>
              <span className="text-3xl font-bold text-blue-600">
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClear}
                className="flex-1 border-2 border-neutral-300 text-neutral-700 px-6 py-3 rounded-xl font-semibold hover:bg-neutral-50 transition-all"
              >
                Clear Cart
              </button>
              <button className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Orders Component
function Orders() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, loading, error } = useAPI(
    () => buyerAPI.getMyOrders(statusFilter),
    [statusFilter]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-800">My Orders</h3>
          <p className="text-neutral-500">Total: {data?.total || 0} orders</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {order.hub_name} • {order.items?.length || 0} items
                </p>
                <p className="text-sm text-neutral-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-neutral-500">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${order.total_amount}
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
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

// Purchase History Component
function PurchaseHistory() {
  const { data, loading, error } = useAPI(() => buyerAPI.getPurchaseHistory());

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-neutral-800">
          Purchase History
        </h3>
        <p className="text-neutral-500">Your buying trends and analytics</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Spending */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
          <h4 className="text-xl font-bold text-neutral-800 mb-4">
            Monthly Spending
          </h4>
          <div className="space-y-3">
            {data?.monthlySpending?.map((item, i) => (
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
                <div className="text-right">
                  <p className="font-bold text-blue-600">${item.total_spent}</p>
                  <p className="text-sm text-neutral-500">
                    {item.order_count} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
          <h4 className="text-xl font-bold text-neutral-800 mb-4">
            Most Purchased
          </h4>
          <div className="space-y-3">
            {data?.topProducts?.map((item, i) => (
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
                  <p className="font-bold text-emerald-600">
                    ${item.total_spent}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {item.total_quantity} {item.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Notifications Component
function Notifications() {
  const { data, loading, error } = useAPI(() => buyerAPI.getNotifications());

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
              !notif.is_read ? "border-l-4 border-l-blue-500" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Bell className="text-blue-600" size={20} />
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
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
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
        <p className="text-neutral-500">Manage your buyer account</p>
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
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <h4 className="text-lg font-bold mb-4">Account Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="text-blue-100">Member Since</span>
                <span className="font-bold">Jan 2025</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="text-blue-100">Total Orders</span>
                <span className="font-bold">45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Status</span>
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
