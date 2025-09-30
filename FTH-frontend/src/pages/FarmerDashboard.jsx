import { useState } from "react";
import Sidebar from "./farmer/components/Sidebar";
import Navbar from "./farmer/components/Navbar";
import MyProducts from "./farmer/MyProducts";
import AddProduct from "./farmer/AddProduct";
import Sales from "./farmer/Sales";
import Payouts from "./farmer/Payouts";
import Notifications from "./farmer/Notifications";
import Profile from "./farmer/Profile";

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState("products");

  const renderTab = () => {
    switch (activeTab) {
      case "products":
        return <MyProducts />;
      case "add":
        return <AddProduct />;
      case "sales":
        return <Sales />;
      case "payouts":
        return <Payouts />;
      case "notifications":
        return <Notifications />;
      case "profile":
        return <Profile />;
      default:
        return <MyProducts />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        role="farmer"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <Navbar role="Farmer" />
        <main className="p-6 overflow-y-auto">{renderTab()}</main>
      </div>
    </div>
  );
}
