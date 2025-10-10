import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Loader2, Eye, EyeOff } from "lucide-react";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";

export default function FarmerSignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.signupFarmer({
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Account created successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-3xl shadow-2xl p-8 space-y-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-2xl mb-4">
            <Sprout className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Buyer Signup Page
          </h1>
          <p className="text-emerald-100">Create your Buyer account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+250 788 123 456"
            required
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Creating
                account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <a
            href="/login"
            className="text-blue-900 text-sm font-medium hover:underline"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
