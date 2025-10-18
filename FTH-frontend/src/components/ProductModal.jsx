import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, AlertCircle, Download, Plus } from "lucide-react";
import { clerkAPI } from "../services/api";
import { useAPICall } from "../hooks/useAPI";
import { ProductReceipt } from "./ProductReceipt";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  editProduct = null,
  viewProduct = null, // for viewing existing product receipt
}) {
  const receiptRef = useRef(null);
  const { execute, loading, error } = useAPICall();
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [newProduct, setNewProduct] = useState(null);
  const [farmerDetails, setFarmerDetails] = useState(null);

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

  // Load farmers
  useEffect(() => {
    if (isOpen) loadFarmers();
  }, [isOpen]);

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

  // Handle edit or view mode
  useEffect(() => {
    if (editProduct || viewProduct) {
      const product = editProduct || viewProduct;
      setFormData({
        farmerId: product.farmer_id || "",
        produceName: product.produce_name || "",
        category: product.category || "",
        quantity: product.quantity || "",
        unit: product.unit || "Kg",
        pricePerUnit: product.price_per_unit || "",
        expiryDate: product.expiry_date
          ? new Date(product.expiry_date).toISOString().split("T")[0]
          : "",
        notes: product.notes || "",
      });

      if (viewProduct) {
        setNewProduct(product);
        setFarmerDetails({
          full_name: product.farmer_name,
          phone: product.farmer_phone,
        });
        setShowPreview(true);
      }
    }
  }, [editProduct, viewProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.farmerId) errors.farmerId = "Please select a farmer";
    if (!formData.produceName?.trim())
      errors.produceName = "Product name is required";
    if (!formData.quantity || parseFloat(formData.quantity) <= 0)
      errors.quantity = "Quantity must be greater than 0";
    if (!formData.unit?.trim()) errors.unit = "Unit is required";
    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0)
      errors.pricePerUnit = "Price must be greater than 0";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let result;
      if (editProduct) {
        result = await execute(clerkAPI.updateProduct, editProduct.id, {
          quantity: parseFloat(formData.quantity),
          pricePerUnit: parseFloat(formData.pricePerUnit),
          notes: formData.notes,
        });
      } else {
        result = await execute(clerkAPI.registerProduct, {
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

      const savedProduct = result?.data?.lot || {
        ...formData,
        lot_code: `LOT-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      const farmer = farmers.find((f) => f.id == formData.farmerId);

      setNewProduct(savedProduct);
      setFarmerDetails(farmer);
      setShowPreview(true); // auto show receipt
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to save product:", err);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return alert("Receipt not ready. Please wait.");

    try {
      setDownloadingPDF(true);
      await new Promise((r) => setTimeout(r, 400)); // ensure render complete

      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff", // prevents transparent background issues
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${newProduct?.lot_code || Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      alert("⚠️ PDF generation failed. Please try again.");
    } finally {
      setDownloadingPDF(false);
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
    setShowPreview(false);
    setNewProduct(null);
    setFarmerDetails(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {viewProduct
              ? "View Product Receipt"
              : editProduct
              ? "Edit Product"
              : "Register New Product"}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Receipt Preview */}
        {showPreview && newProduct && farmerDetails ? (
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div
              ref={receiptRef}
              className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto"
            >
              <ProductReceipt product={newProduct} farmer={farmerDetails} />
            </div>
          </div>
        ) : (
          !viewProduct && (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6 overflow-y-auto flex-1"
            >
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

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Price Per Unit (Rwf) <span className="text-red-500">*</span>
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

              {/* Total */}
              {formData.quantity && formData.pricePerUnit && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700 font-medium">
                      Total Value:
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {(
                        parseFloat(formData.quantity) *
                        parseFloat(formData.pricePerUnit)
                      ).toFixed(2)}{" "}
                      Rwf
                    </span>
                  </div>
                </div>
              )}

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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {editProduct ? "Updating..." : "Registering..."}
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      {editProduct
                        ? "Update Product"
                        : "Register & Pay Product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )
        )}

        {/* Footer (PDF & Close) */}
        {showPreview && (
          <div className="border-t p-4 bg-white flex justify-center gap-4">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold"
            >
              {downloadingPDF ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Downloading...
                </>
              ) : (
                <>
                  <Download size={18} /> Download PDF
                </>
              )}
            </button>
            <button
              onClick={handleClose}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
