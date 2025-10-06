// // src/components/admin/AdminUserModal.jsx
import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { adminAPI } from "../../services/api";
import { useAPICall } from "../../hooks/useAPI";

export default function AdminUserModal({
  isOpen,
  onClose,
  onSuccess,
  editUser,
}) {
  const { execute, loading, error } = useAPICall();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    role: "FARMER",
    is_active: true,
  });

  useEffect(() => {
    if (editUser) {
      setForm({
        full_name: editUser.full_name || "",
        phone: editUser.phone || "",
        email: editUser.email || "",
        password: "",
        role: editUser.role || "FARMER",
        is_active: editUser.is_active ?? true,
      });
    } else {
      setForm({
        full_name: "",
        phone: "",
        email: "",
        password: "",
        role: "FARMER",
        is_active: true,
      });
    }
  }, [editUser, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await execute(adminAPI.updateUser, editUser.id, {
          full_name: form.full_name,
          phone: form.phone,
          email: form.email,
          role: form.role,
          is_active: form.is_active,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await execute(adminAPI.createUser, {
          full_name: form.full_name,
          phone: form.phone,
          email: form.email,
          password: form.password || "ChangeMe123!",
          role: form.role,
          is_active: form.is_active,
        });
      }
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full animate-fadeIn">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {editUser ? "Edit User" : "Create User"}
          </h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
            required
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
            required
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email (optional)"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
          />
          {!editUser && (
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
              required
            />
          )}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
          >
            <option value="FARMER">Farmer</option>
            <option value="CLERK">Clerk / Manager</option>
            <option value="BUYER">Buyer</option>
            <option value="ADMIN">Admin</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="accent-emerald-600"
            />
            Active
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex justify-center items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              {editUser ? "Update" : "Create"}
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mt-2">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
