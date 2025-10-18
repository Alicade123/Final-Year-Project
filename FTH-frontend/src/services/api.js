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

  signupFarmer: (data) =>
    api.post("/auth/register-farmer", data).then((res) => res.data),
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
  addFarmer: (data) => api.post("/clerk/farmers", data).then((res) => res.data),

  updateFarmer: (farmerId, data) =>
    api.put(`/clerk/farmers/${farmerId}`, data).then((res) => res.data),

  deleteFarmer: (farmerId) =>
    api.delete(`/clerk/farmers/${farmerId}`).then((res) => res.data),

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

  //report
  getReports: (startDate, endDate, type, format = null, axiosConfig = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (type) params.append("type", type);
    if (format) params.append("format", format);
    return api.get(`/clerk/reports?${params.toString()}`, axiosConfig);
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

// Buyer Dashboard API calls
export const buyerAPI = {
  // Dashboard
  getDashboardStats: () => api.get("/buyer/dashboard/stats"),

  // Products/Marketplace
  browseProducts: (filters) => {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.hubId) params.append("hubId", filters.hubId);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    return api.get(`/buyer/products?${params}`);
  },

  getProductDetails: (lotId) => api.get(`/buyer/products/${lotId}`),

  getHubs: () => api.get("/buyer/hubs"),

  getCategories: () => api.get("/buyer/categories"),

  // Orders
  createOrder: (orderData) => api.post("/buyer/orders", orderData),

  getMyOrders: (status, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append("status", status);
    return api.get(`/buyer/orders?${params}`);
  },

  getOrderDetails: (orderId) => api.get(`/buyer/orders/${orderId}`),

  cancelOrder: (orderId) => api.post(`/buyer/orders/${orderId}/cancel`),

  // // Payment
  initiatePayment: (orderId, paymentData) =>
    api.post(`/buyer/orders/${orderId}/payment`, paymentData),

  // Purchase History
  getPurchaseHistory: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/buyer/purchase-history?${params}`);
  },
  getProfile: () => api.get("/buyer/profile"),
  updateProfile: (data) => api.put("/buyer/profile", data),

  // Notifications
  getNotifications: (page = 1, limit = 20) =>
    api.get(`/buyer/notifications?page=${page}&limit=${limit}`),

  markNotificationRead: (notificationId) =>
    api.patch(`/buyer/notifications/${notificationId}/read`),
};

// Farmer Dashboard API calls
export const farmerAPI = {
  // Dashboard
  getDashboardStats: () => api.get("/farmer/dashboard/stats"),

  // Products & Deliveries
  getMyProducts: (status, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append("status", status);
    return api.get(`/farmer/products?${params}`);
  },

  getAvailableHubs: () => api.get("/farmer/hubs"),

  requestDelivery: (deliveryData) =>
    api.post("/farmer/deliveries", deliveryData),

  getDeliveryHistory: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/farmer/deliveries/history?${params}`);
  },

  // Sales
  getSalesSummary: () => api.get("/farmer/sales"),

  // Payouts & Earnings
  getPayouts: (status, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append("status", status);
    return api.get(`/farmer/payouts?${params}`);
  },

  getPayoutDetails: (payoutId) => api.get(`/farmer/payouts/${payoutId}`),

  getEarningsAnalytics: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/farmer/earnings/analytics?${params}`);
  },

  // Market Information
  getMarketPrices: () => api.get("/farmer/market-prices"),

  // Notifications
  getNotifications: (page = 1, limit = 20) =>
    api.get(`/farmer/notifications?page=${page}&limit=${limit}`),

  markNotificationRead: (notificationId) =>
    api.patch(`/farmer/notifications/${notificationId}/read`),

  markAllNotificationsRead: () => api.patch("/farmer/notifications/read-all"),

  getProfile: () => api.get("/farmer/profile"),
  updateProfile: (data) => api.put("/farmer/profile", data),
};

export const adminAPI = {
  listUsers: (page = 1, limit = 20, role = "", search = "") =>
    api.get("/admin/users", {
      params: { page, limit, role, search },
    }),

  createUser: (data) => api.post("/admin/users", data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // hubs
  listHubs: () => api.get("/admin/hubs"),
  createHub: (data) => api.post("/admin/hubs", data),
  updateHub: (id, data) => api.put(`/admin/hubs/${id}`, data),
  deleteHub: (id) => api.delete(`/admin/hubs/${id}`),

  // clerks
  getClerks: () => api.get("/admin/clerks"),
};

export const contactAPI = {
  submit: (payload) =>
    api.post("/contacts", payload).then((res) => res.contact),
  list: (params) => api.get("/contacts", { params }).then((res) => res.data), // directly returns array
  get: (id) => api.get(`/contacts/${id}`).then((res) => res.contact || res),
  update: (id, payload) =>
    api.put(`/contacts/${id}`, payload).then((res) => res.contact || res),
};
