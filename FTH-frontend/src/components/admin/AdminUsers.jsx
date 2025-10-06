// // src/components/admin/AdminUsers.jsx
import React, { useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { adminAPI } from "../../services/api";
import { Plus, Loader2, AlertCircle, Search } from "lucide-react";
import AdminUserModal from "./AdminUserModal";

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, loading, error, refetch } = useAPI(
    () => adminAPI.listUsers(page, 20, roleFilter, searchQuery),
    [page, roleFilter, searchQuery, refreshKey]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="mx-auto text-red-600 mb-3" size={48} />
        <p className="text-red-700 font-semibold mb-2">Failed to load users</p>
        <button
          onClick={refetch}
          className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        <button
          onClick={() => {
            setEditUser(null);
            setIsModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or phone"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="CLERK">Clerk</option>
          <option value="FARMER">Farmer</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-emerald-600 text-white">
            <tr>
              {["Name", "Phone", "Email", "Role", "Active", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {data?.users?.length ? (
              data.users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b hover:bg-emerald-50 transition"
                >
                  <td className="px-4 py-2">{u.full_name}</td>
                  <td className="px-4 py-2">{u.phone}</td>
                  <td className="px-4 py-2">{u.email || "—"}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => {
                        setEditUser(u);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Delete user?")) {
                          await adminAPI.deleteUser(u.id);
                          triggerRefresh();
                        }
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 text-sm"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.total > 20 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(data.total / 20)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.total / 20)}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      <AdminUserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditUser(null);
        }}
        onSuccess={triggerRefresh}
        editUser={editUser}
      />
    </div>
  );
}
