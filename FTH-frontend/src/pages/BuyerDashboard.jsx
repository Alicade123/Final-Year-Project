import { useState } from "react";
import Sidebar from "../components/BUYERS/components/Sidebar";
import Navbar from "../components/BUYERS/components/Navbar";
import ProductBrowse from "../components/BUYERS/ProductBrowse";
import Orders from "../components/BUYERS/Orders";
import Payments from "../components/BUYERS/Payments";
import Profile from "../components/BUYERS/Profile";

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("products");

  const renderTab = () => {
    switch (activeTab) {
      case "products":
        return <ProductBrowse />;
      case "orders":
        return <Orders />;
      case "payments":
        return <Payments />;
      case "profile":
        return <Profile />;
      default:
        return <ProductBrowse />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar role="buyer" activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <Navbar role="Buyer" />
        <main className="p-6 overflow-y-auto">{renderTab()}</main>
      </div>
    </div>
  );
}
