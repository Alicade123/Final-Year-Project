import React, { useState, useEffect } from "react";
import { X, Plus, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { clerkAPI } from "../services/api";
import { useAPI, useAPICall } from "../hooks/useAPI";
export function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  editProduct = null,
}) {
  const { execute, loading, error } = useAPICall();
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [formData, setFormData] = useState({
    farmerId: "",
    produceName: "",
    category: "",
    quantity: "",
    unit: "Kg",
    pricePerUnit: "",
    expiryDate: "",
    notes: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Load farmers on mount
  useEffect(() => {
    if (isOpen) {
      loadFarmers();
    }
  }, [isOpen]);

  // Populate form if editing
  useEffect(() => {
    if (editProduct) {
      setFormData({
        farmerId: editProduct.farmer_id || "",
        produceName: editProduct.produce_name || "",
        category: editProduct.category || "",
        quantity: editProduct.quantity || "",
        unit: editProduct.unit || "Kg",
        pricePerUnit: editProduct.price_per_unit || "",
        expiryDate: editProduct.expiry_date
          ? new Date(editProduct.expiry_date).toISOString().split("T")[0]
          : "",
        notes: editProduct.notes || "",
      });
    }
  }, [editProduct]);

  const loadFarmers = async () => {
    try {
      setLoadingFarmers(true);
      const result = await clerkAPI.getFarmers(1, 100);
      setFarmers(result.farmers || []);
    } catch (err) {
      console.error("Failed to load farmers:", err);
    } finally {
      setLoadingFarmers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
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

    if (!formData.farmerId) {
      errors.farmerId = "Please select a farmer";
    }
    if (!formData.produceName || formData.produceName.trim().length === 0) {
      errors.produceName = "Product name is required";
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      errors.quantity = "Quantity must be greater than 0";
    }
    if (!formData.unit || formData.unit.trim().length === 0) {
      errors.unit = "Unit is required";
    }
    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
      errors.pricePerUnit = "Price must be greater than 0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editProduct) {
        await execute(clerkAPI.updateProduct, editProduct.id, {
          quantity: parseFloat(formData.quantity),
          pricePerUnit: parseFloat(formData.pricePerUnit),
          notes: formData.notes,
        });
      } else {
        await execute(clerkAPI.registerProduct, {
          farmerId: formData.farmerId,
          produceName: formData.produceName,
          category: formData.category,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          pricePerUnit: parseFloat(formData.pricePerUnit),
          expiryDate: formData.expiryDate || null,
          notes: formData.notes,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error("Failed to save product:", err);
    }
  };

  const handleClose = () => {
    setFormData({
      farmerId: "",
      produceName: "",
      category: "",
      quantity: "",
      unit: "Kg",
      pricePerUnit: "",
      expiryDate: "",
      notes: "",
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
            {editProduct ? "Edit Product" : "Register New Product"}
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
                {editProduct ? "Product Updated!" : "Product Registered!"}
              </h3>
              <p className="text-neutral-600">
                {editProduct
                  ? "The product has been updated successfully."
                  : "The product has been added to your inventory."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Banner */}
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
                {/* Farmer Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Select Farmer <span className="text-red-500">*</span>
                  </label>
                  {loadingFarmers ? (
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Loader2 className="animate-spin" size={16} />
                      Loading farmers...
                    </div>
                  ) : (
                    <select
                      name="farmerId"
                      value={formData.farmerId}
                      onChange={handleChange}
                      disabled={editProduct !== null}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        validationErrors.farmerId
                          ? "border-red-500"
                          : "border-neutral-300"
                      } ${
                        editProduct ? "bg-neutral-100 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="">Choose a farmer...</option>
                      {farmers.map((farmer) => (
                        <option key={farmer.id} value={farmer.id}>
                          {farmer.full_name} - {farmer.phone}
                        </option>
                      ))}
                    </select>
                  )}
                  {validationErrors.farmerId && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.farmerId}
                    </p>
                  )}
                </div>

                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="produceName"
                    value={formData.produceName}
                    onChange={handleChange}
                    disabled={editProduct !== null}
                    placeholder="e.g., Maize, Beans, Tomatoes"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      validationErrors.produceName
                        ? "border-red-500"
                        : "border-neutral-300"
                    } ${
                      editProduct ? "bg-neutral-100 cursor-not-allowed" : ""
                    }`}
                  />
                  {validationErrors.produceName && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.produceName}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={editProduct !== null}
                    className={`w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      editProduct ? "bg-neutral-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Select category...</option>
                    <option value="Grains">Grains</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Legumes">Legumes</option>
                    <option value="Tubers">Tubers</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    disabled={editProduct !== null}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      validationErrors.unit
                        ? "border-red-500"
                        : "border-neutral-300"
                    } ${
                      editProduct ? "bg-neutral-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="Kg">Kilogram (Kg)</option>
                    <option value="Ton">Ton</option>
                    <option value="Bag">Bag</option>
                    <option value="Crate">Crate</option>
                    <option value="Piece">Piece</option>
                    <option value="Liter">Liter</option>
                  </select>
                  {validationErrors.unit && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.unit}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      validationErrors.quantity
                        ? "border-red-500"
                        : "border-neutral-300"
                    }`}
                  />
                  {validationErrors.quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.quantity}
                    </p>
                  )}
                </div>

                {/* Price Per Unit */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Price Per Unit ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={formData.pricePerUnit}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      validationErrors.pricePerUnit
                        ? "border-red-500"
                        : "border-neutral-300"
                    }`}
                  />
                  {validationErrors.pricePerUnit && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.pricePerUnit}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    disabled={editProduct !== null}
                    className={`w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      editProduct ? "bg-neutral-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional information..."
                    rows="3"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Total Calculation Display */}
              {formData.quantity && formData.pricePerUnit && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700 font-medium">
                      Total Value:
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      $
                      {(
                        parseFloat(formData.quantity) *
                        parseFloat(formData.pricePerUnit)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {editProduct ? "Updating..." : "Registering..."}
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      {editProduct ? "Update Product" : "Register Product"}
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
