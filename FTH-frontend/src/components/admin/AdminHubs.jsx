// // src/components/admin/AdminHubs.jsx
import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { Loader2, MapPin, Edit3, Plus, X } from "lucide-react";

export default function AdminHubs() {
  const [hubs, setHubs] = useState([]);
  const [clerks, setClerks] = useState([]);
  const [form, setForm] = useState({ name: "", location: "", manager_id: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState(null);

  const fetchHubs = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.listHubs();
      setHubs(data.hubs || []);
    } catch (err) {
      setError("Failed to fetch hubs");
    } finally {
      setLoading(false);
    }
  };

  const fetchClerks = async () => {
    try {
      const data = await adminAPI.getClerks();
      setClerks(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHubs();
    fetchClerks();
  }, []);

  const openAddModal = () => {
    setForm({ name: "", location: "", manager_id: "" });
    setEditingHub(null);
    setModalOpen(true);
  };

  const openEditModal = (hub) => {
    setForm({
      name: hub.name,
      location: hub.location,
      manager_id: hub.manager_id || "",
    });
    setEditingHub(hub);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location) {
      alert("Name and location are required");
      return;
    }

    try {
      setLoading(true);
      if (editingHub) {
        await adminAPI.updateHub(editingHub.id, form);
        alert("Hub updated successfully!");
      } else {
        await adminAPI.createHub(form);
        alert("Hub created successfully!");
      }
      setModalOpen(false);
      fetchHubs();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to submit hub");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-6 py-8 md:px-10 transition-all">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 tracking-tight">
          Hubs Management
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-700 transition-all"
        >
          <Plus size={18} />
          Add Hub
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-emerald-600" size={42} />
          </div>
        ) : error ? (
          <p className="text-center text-red-600 py-6">{error}</p>
        ) : hubs.length === 0 ? (
          <p className="text-center py-10 text-gray-500">No hubs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm md:text-base border-collapse">
              <thead className="bg-emerald-600 text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Hub Name</th>
                  <th className="text-left px-4 py-3 font-medium">Location</th>
                  <th className="text-left px-4 py-3 font-medium">Manager</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hubs.map((h) => (
                  <tr
                    key={h.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {h.name}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2 text-gray-600">
                      <MapPin size={16} className="text-emerald-500" />
                      {h.location}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {h.manager_name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEditModal(h)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fadeIn">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-emerald-700">
                {editingHub ? "Edit Hub" : "Add Hub"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-red-600"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Hub Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Assign Manager (Clerk)
                </label>
                <select
                  value={form.manager_id}
                  onChange={(e) =>
                    setForm({ ...form, manager_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Select Manager --</option>
                  {clerks.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 border rounded-lg hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin" size={16} />}
                  {editingHub ? "Update Hub" : "Create Hub"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
