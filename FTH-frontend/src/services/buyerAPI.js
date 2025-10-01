import api from "./api"; // your axios instance

const buyerAPI = {
  getDashboardStats: () =>
    api.get("/buyer/dashboard/stats").then((res) => res.data),
  browseProducts: (filters) =>
    api.get("/buyer/products", { params: filters }).then((res) => res.data),
  getHubs: () => api.get("/buyer/hubs").then((res) => res.data),
  getCategories: () => api.get("/buyer/categories").then((res) => res.data),
  createOrder: (orderData) =>
    api.post("/buyer/orders", orderData).then((res) => res.data),
  getMyOrders: (status) =>
    api
      .get("/buyer/orders", { params: status ? { status } : {} })
      .then((res) => res.data),
  getOrderDetails: (orderId) =>
    api.get(`/buyer/orders/${orderId}`).then((res) => res.data),
  cancelOrder: (orderId) =>
    api.post(`/buyer/orders/${orderId}/cancel`).then((res) => res.data),
  initiatePayment: (orderId, data) =>
    api.post(`/buyer/orders/${orderId}/payment`, data).then((res) => res.data),
  getPurchaseHistory: () =>
    api.get("/buyer/purchase-history").then((res) => res.data),
  getNotifications: () =>
    api.get("/buyer/notifications").then((res) => res.data),
};

export default buyerAPI;
