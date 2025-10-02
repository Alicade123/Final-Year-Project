// Placeholder API - will be replaced with actual API service
import api, { buyerAPI } from "./api"; // your axios instance
// Import API functions (to be added to api.js)
const farmerAPI = {
  getDashboardStats: () =>
    fetch("/api/farmer/dashboard/stats").then((r) => r.json()),
  getMyProducts: (status) =>
    fetch(`/api/farmer/products${status ? "?status=" + status : ""}`).then(
      (r) => r.json()
    ),
  getAvailableHubs: () => fetch("/api/farmer/hubs").then((r) => r.json()),
  requestDelivery: (data) =>
    fetch("/api/farmer/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  getDeliveryHistory: () =>
    fetch("/api/farmer/deliveries/history").then((r) => r.json()),
  getPayouts: (status) =>
    fetch(`/api/farmer/payouts${status ? "?status=" + status : ""}`).then((r) =>
      r.json()
    ),
  getEarningsAnalytics: () =>
    fetch("/api/farmer/earnings/analytics").then((r) => r.json()),
  getMarketPrices: () =>
    fetch("/api/farmer/market-prices").then((r) => r.json()),
  getSalesSummary: () => fetch("/api/farmer/sales").then((r) => r.json()),
  getNotifications: () =>
    fetch("/api/farmer/notifications").then((r) => r.json()),
};
export default farmerAPI;
