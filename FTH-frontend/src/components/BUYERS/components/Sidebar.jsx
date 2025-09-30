import { ShoppingCart, Package, CreditCard, User } from "lucide-react";

export default function Sidebar({ role, activeTab, setActiveTab }) {
  const menu = [
    {
      key: "products",
      label: "Browse Products",
      icon: <ShoppingCart size={18} />,
    },
    { key: "orders", label: "My Orders", icon: <Package size={18} /> },
    { key: "payments", label: "Payments", icon: <CreditCard size={18} /> },
    { key: "profile", label: "Profile", icon: <User size={18} /> },
  ];

  return (
    <aside className="w-64 bg-green-900 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-green-700">
        Buyer Panel
      </div>
      <nav className="flex-1">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-green-800 transition ${
              activeTab === item.key ? "bg-green-700" : ""
            }`}
          >
            {item.icon}
            <span className="ml-3">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
