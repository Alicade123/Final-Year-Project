// src/pages/ContactUs.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Loader2 } from "lucide-react";
import { contactAPI } from "../services/api"; // import accordingly
import { toast } from "react-toastify";

export default function ContactUs() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.message)
      return toast.error("Please provide your name and message.");

    setLoading(true);
    try {
      await contactAPI.submit(form);
      toast.success("Message sent. Admin will contact you soon.");
      setForm({
        full_name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      navigate("/"); // or stay and show success
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-600 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sprout className="text-amber-400" size={36} />
          <div>
            <h2 className="text-2xl font-bold text-white">Contact Support</h2>
            <p className="text-emerald-100 text-sm">
              Send us a message and we will get back to you.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="full_name"
              placeholder="Full name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email (optional)"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white"
            />
          </div>

          <input
            name="phone"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white"
          />

          <input
            name="subject"
            placeholder="Subject (optional)"
            value={form.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white"
          />

          <textarea
            name="message"
            placeholder="Your message"
            value={form.message}
            onChange={handleChange}
            rows="6"
            required
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white"
          />

          <div className="flex gap-3 items-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 text-white px-6 py-3 rounded-xl font-semibold shadow hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Send Message"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-white/80 text-sm hover:underline"
            >
              Back to Landing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
