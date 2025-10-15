import React, { useEffect, useState } from "react";
import { contactAPI } from "../../services/api";
import { Loader2, Mail, Phone, User, CheckCircle, Eye } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null); // For modal

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await contactAPI.list();
      setContacts(data || []);
    } catch (err) {
      toast.error("Failed to fetch contacts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await contactAPI.update(id, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      loadContacts();
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );

  if (!contacts.length)
    return (
      <div className="text-center text-gray-500 py-10">
        No messages received yet.
      </div>
    );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-700">
        User Messages & Reports
      </h2>

      {/* Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedMessage(null)}
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-2">
              {selectedMessage.subject || "No Subject"}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {selectedMessage.message}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left text-sm">Name</th>
              <th className="py-3 px-4 text-left text-sm">Contact Info</th>
              <th className="py-3 px-4 text-left text-sm">Subject</th>
              <th className="py-3 px-4 text-left text-sm">Message</th>
              <th className="py-3 px-4 text-left text-sm">Status</th>
              <th className="py-3 px-4 text-left text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr
                key={c.id}
                className="border-b last:border-none hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4 flex items-center gap-2">
                  <User size={16} className="text-emerald-600" />
                  {c.full_name}
                </td>
                <td className="py-3 px-4 space-y-1 text-sm text-gray-700">
                  {c.email && (
                    <div className="flex items-center gap-1">
                      <Mail size={14} /> {c.email}
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={14} /> {c.phone}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm">{c.subject || "-"}</td>
                <td className="py-3 px-4 text-sm max-w-sm">
                  <div className="truncate">{c.message}</div>
                  <button
                    className="mt-1 text-blue-600 hover:underline inline-flex items-center gap-1 text-xs"
                    onClick={() => setSelectedMessage(c)}
                  >
                    <Eye size={12} /> View
                  </button>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      c.status === "NEW"
                        ? "bg-amber-100 text-amber-700"
                        : c.status === "OPEN"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-2">
                  {c.status !== "OPEN" && (
                    <button
                      onClick={() => handleStatusChange(c.id, "OPEN")}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Mark Open
                    </button>
                  )}
                  {c.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleStatusChange(c.id, "RESOLVED")}
                      className="text-emerald-600 text-sm hover:underline"
                    >
                      <CheckCircle size={14} className="inline mr-1" />
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
