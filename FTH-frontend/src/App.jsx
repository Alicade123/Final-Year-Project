import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ClerkDashboard from "./pages/ClerkDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <main className="max-w-8xl mx-auto">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/clerk" element={<ClerkDashboard />} />
          <Route path="/buyer" element={<BuyerDashboard />} />
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
