import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Loader2, Eye, EyeOff, Info } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { authAPI } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInfoGoogle, setShowInfoGoogle] = useState(false);
  const [showInfoSignup, setShowInfoSignup] = useState(false);

  const redirectByRole = (role) => {
    switch (role) {
      case "BUYER":
        navigate("/buyer");
        break;
      case "CLERK":
        navigate("/clerk");
        break;
      case "FARMER":
        navigate("/farmer");
        break;
      case "ADMIN":
        navigate("/admin");
        break;
      default:
        navigate("/");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData.phone, formData.password);
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userRole", response.user.role);
      localStorage.setItem("user", JSON.stringify(response.user));
      redirectByRole(response.user.role);
    } catch (err) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-600 flex items-center justify-center p-4 relative">
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-2xl mb-4">
            <Sprout className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Trade Hub Portal
          </h1>
          {/* <p className="text-emerald-100 text-lg">Sign in to manage your hub</p> */}
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-3xl shadow-2xl p-8 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+250 788 123 456"
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Info for Google */}
          <div
            className="relative flex items-center justify-center text-sm text-emerald-100 py-2 group"
            onMouseEnter={() => setShowInfoGoogle(true)}
            onMouseLeave={() => setShowInfoGoogle(false)}
          >
            <span className="bg-transparent px-2 flex items-center gap-2">
              or continue with{" "}
              <Info size={16} className="text-amber-300 cursor-pointer" />
            </span>
            {showInfoGoogle && (
              <div className="absolute bottom-10 bg-black/80 text-white text-xs px-3 py-2 rounded-lg w-60 text-center shadow-lg">
                If you don’t have an account, Google Sign-in will automatically
                create one for you as a{" "}
                <span className="font-bold text-amber-300">Buyer</span>.
              </div>
            )}
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border-2 border-white/30 text-white py-3 rounded-xl hover:bg-white/20 transition-all"
          >
            <FaGoogle size={20} /> Sign in with Google
          </button>

          {/* Farmer Signup Info */}
          <div
            className="relative group"
            onMouseEnter={() => setShowInfoSignup(true)}
            onMouseLeave={() => setShowInfoSignup(false)}
          >
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full bg-white/10 border-2 border-white/30 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all mt-3 flex items-center justify-center gap-2"
            >
              Signup for Buyer Account{" "}
              <Info size={16} className="text-amber-300" />
            </button>
            {showInfoSignup && (
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-2 rounded-lg w-64 text-center shadow-lg">
                Only <span className="font-bold text-amber-300">Buyers</span>{" "}
                can create an account using this signup option.
              </div>
            )}
          </div>

          {/* Landing Page Button */}
          <div className="text-center mt-4">
            <a
              href="/"
              className="text-blue-900 text-sm font-medium hover:underline"
            >
              Back to Landing Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
