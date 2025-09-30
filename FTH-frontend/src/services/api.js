// src/services/api.js
import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle specific error codes
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else if (error.response.status === 403) {
        console.error("Access denied");
      }

      // Return error message from backend
      return Promise.reject(
        error.response.data?.error ||
          error.response.data?.message ||
          "An error occurred"
      );
    } else if (error.request) {
      return Promise.reject("Network error - please check your connection");
    } else {
      return Promise.reject(error.message);
    }
  }
);

// Auth API calls
export const authAPI = {
  login: (phone, password) => api.post("/auth/login", { phone, password }),

  register: (userData) => api.post("/auth/register", userData),

  getProfile: () => api.get("/auth/profile"),

  updateProfile: (userData) => api.put("/auth/profile", userData),

  changePassword: (currentPassword, newPassword) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),

  logout: () => api.post("/auth/logout"),
};

// Clerk Dashboard API calls
export const clerkAPI = {
  // Dashboard
  getDashboardStats: () => api.get("/clerk/dashboard/stats"),

  getRecentActivity: (limit = 10) =>
    api.get(`/clerk/dashboard/activity?limit=${limit}`),

  // Farmers
  getFarmers: (page = 1, limit = 20) =>
    api.get(`/clerk/farmers?page=${page}&limit=${limit}`),

  getFarmerDetails: (farmerId) => api.get(`/clerk/farmers/${farmerId}`),

  // Products
  getProducts: (status = "AVAILABLE", page = 1, limit = 20) =>
    api.get(`/clerk/products?status=${status}&page=${page}&limit=${limit}`),

  registerProduct: (productData) => api.post("/clerk/products", productData),

  updateProduct: (lotId, productData) =>
    api.put(`/clerk/products/${lotId}`, productData),

  deleteProduct: (lotId) => api.delete(`/clerk/products/${lotId}`),

  // Orders
  getOrders: (status, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append("status", status);
    return api.get(`/clerk/orders?${params}`);
  },

  getOrderDetails: (orderId) => api.get(`/clerk/orders/${orderId}`),

  updateOrderStatus: (orderId, status) =>
    api.patch(`/clerk/orders/${orderId}/status`, { status }),

  // Payouts
  getPayouts: (status, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append("status", status);
    return api.get(`/clerk/payouts?${params}`);
  },

  processPayout: (payoutId, providerRef) =>
    api.post(`/clerk/payouts/${payoutId}/process`, { providerRef }),

  // Reports
  getReports: (startDate, endDate, type) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (type) params.append("type", type);
    return api.get(`/clerk/reports?${params}`);
  },

  // Notifications
  getNotifications: (page = 1, limit = 20) =>
    api.get(`/clerk/notifications?page=${page}&limit=${limit}`),

  markNotificationRead: (notificationId) =>
    api.patch(`/clerk/notifications/${notificationId}/read`),

  markAllNotificationsRead: () => api.patch("/clerk/notifications/read-all"),

  // Settings
  getHubSettings: () => api.get("/clerk/settings"),

  updateHubSettings: (settingsData) => api.put("/clerk/settings", settingsData),
};

export default api;
