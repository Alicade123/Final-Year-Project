import React, { useState, useEffect } from "react";
import { X, Plus, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { clerkAPI } from "../services/api";
import { useAPICall } from "../hooks/useAPI";

export function UserModal({ isOpen, onClose, onSuccess, editUser = null }) {
  const { execute, loading, error } = useAPICall();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    role: "FARMER",
    farmSize: "",
    location: "",
    hubId: "",
    isActive: true,
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Populate form if editing
  useEffect(() => {
    if (editUser) {
      setFormData({
        fullName: editUser.full_name || "",
        phone: editUser.phone || "",
        email: editUser.email || "",
        password: "", // don’t prefill password
        role: editUser.role || "FARMER",
        farmSize: editUser.metadata?.farm_size || "",
        location: editUser.metadata?.location || "",
        hubId: editUser.metadata?.hub_id || "",
        isActive: editUser.is_active ?? true,
      });
    }
  }, [editUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    if (!editUser && !formData.password.trim())
      errors.password = "Password is required";
    if (!formData.role) errors.role = "Role is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || null,
        password: formData.password || undefined,
        role: formData.role,
        metadata: {
          farm_size: formData.farmSize,
          location: formData.location,
          hub_id: formData.hubId,
        },
        isActive: formData.isActive,
      };

      if (editUser) {
        await execute(clerkAPI.updateUser, editUser.id, payload);
      } else {
        await execute(clerkAPI.registerUser, payload);
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error("Failed to save user:", err);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      password: "",
      role: "FARMER",
      farmSize: "",
      location: "",
      hubId: "",
      isActive: true,
    });
    setValidationErrors({});
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {editUser ? "Edit User" : "Register New User"}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle
                className="mx-auto text-emerald-600 mb-4"
                size={64}
              />
              <h3 className="text-2xl font-bold text-neutral-800 mb-2">
                {editUser ? "User Updated!" : "User Registered!"}
              </h3>
              <p className="text-neutral-600">
                {editUser
                  ? "The user account has been updated successfully."
                  : "The new user has been created successfully."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle
                    className="text-red-600 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 mb-1">Error</h4>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl ${
                      validationErrors.fullName
                        ? "border-red-500"
                        : "border-neutral-300"
                    }`}
                  />
                  {validationErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl ${
                      validationErrors.phone
                        ? "border-red-500"
                        : "border-neutral-300"
                    }`}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl"
                  />
                </div>

                {/* Password */}
                {!editUser && (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl ${
                        validationErrors.password
                          ? "border-red-500"
                          : "border-neutral-300"
                      }`}
                    />
                    {validationErrors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl"
                  >
                    <option value="FARMER">Farmer</option>
                    <option value="CLERK">Clerk/Hub Manager</option>
                    <option value="BUYER">Buyer</option>
                  </select>
                </div>

                {/* Farm Size */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Farm Size
                  </label>
                  <input
                    type="text"
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    placeholder="e.g., 12 hectares"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Ruhango"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl"
                  />
                </div>

                {/* Hub ID */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Hub ID
                  </label>
                  <input
                    type="text"
                    name="hubId"
                    value={formData.hubId}
                    onChange={handleChange}
                    placeholder="UUID of hub"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl"
                  />
                </div>

                {/* Active */}
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-emerald-600 rounded border-neutral-300"
                  />
                  <span className="text-neutral-700">Active</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {editUser ? "Updating..." : "Registering..."}
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      {editUser ? "Update User" : "Register User"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
