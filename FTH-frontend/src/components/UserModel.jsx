import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
} from "lucide-react";
import { clerkAPI } from "../services/api";

export default function UserModal({
  isOpen,
  onClose,
  onSuccess,
  editFarmer = null,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    location: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (editFarmer) {
      setFormData({
        fullName: editFarmer.full_name || "",
        phone: editFarmer.phone || "",
        email: editFarmer.email || "",
        password: "",
        location: editFarmer.metadata?.location || "",
        isActive: editFarmer.is_active ?? true,
      });
    } else {
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        location: "",
        isActive: true,
      });
    }
  }, [editFarmer]);

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
    if (!formData.fullName?.trim()) errors.fullName = "Full name is required";
    if (!formData.phone?.trim()) errors.phone = "Phone number is required";
    else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone))
      errors.phone = "Please enter a valid phone number";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Please enter a valid email address";
    if (!editFarmer && (!formData.password || formData.password.length < 6))
      errors.password = "Password must be at least 6 characters";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      if (editFarmer) {
        await clerkAPI.updateFarmer(editFarmer.id, {
          fullName: formData.fullName,
          email: formData.email || null,
          location: formData.location,
          isActive: formData.isActive,
        });
      } else {
        await clerkAPI.addFarmer({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email || null,
          password: formData.password,
          location: formData.location,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to save farmer");
      console.error("Error saving farmer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      password: "",
      location: "",
      isActive: true,
    });
    setValidationErrors({});
    setError("");
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {editFarmer ? "Edit Farmer" : "Add New Farmer"}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle
                className="mx-auto text-emerald-600 mb-4"
                size={64}
              />
              <h3 className="text-2xl font-bold text-neutral-800 mb-2">
                {editFarmer ? "Farmer Updated!" : "Farmer Added!"}
              </h3>
              <p className="text-neutral-600">
                {editFarmer
                  ? "The farmer information has been updated successfully."
                  : "The farmer has been registered successfully."}
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
                    <User className="inline mr-2" size={16} />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g., John Doe"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
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
                    <Phone className="inline mr-2" size={16} />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!!editFarmer}
                    placeholder="+250 788 123 456"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      editFarmer ? "bg-neutral-100 cursor-not-allowed" : ""
                    } ${
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
                  {editFarmer && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Phone number cannot be changed
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    <Mail className="inline mr-2" size={16} />
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="farmer@example.com"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      validationErrors.email
                        ? "border-red-500"
                        : "border-neutral-300"
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                {!editFarmer && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      <Lock className="inline mr-2" size={16} />
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
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

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Ruhango District"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {/* Active */}
                {editFarmer && (
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 p-4 border border-neutral-300 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-neutral-800">
                          Active Status
                        </span>
                        <p className="text-sm text-neutral-600">
                          Farmer can deliver and receive payments
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Buttons */}
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />{" "}
                      {editFarmer ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />{" "}
                      {editFarmer ? "Update Farmer" : "Add Farmer"}
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
