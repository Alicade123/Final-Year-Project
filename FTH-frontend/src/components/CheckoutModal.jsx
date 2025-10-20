// src/components/CheckoutModal.jsx
import { useState } from "react";
import { X, Loader2, MapPin } from "lucide-react";
import { useAPICall } from "../hooks/useAPI";
import { buyerAPI } from "../services/api";

export default function CheckoutModal({ cart, hubId, onClose, onSuccess }) {
  const { execute, loading, error } = useAPICall();
  const [confirming, setConfirming] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price_per_unit * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      setConfirming(true);

      const items = cart.map((item) => ({
        lotId: item.id,
        quantity: item.quantity,
      }));

      const order = await execute(buyerAPI.createOrder, { hubId, items });

      onSuccess(order); // parent can clear cart, redirect, or open payment
      onClose();
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Confirm Checkout</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-neutral-800 mb-2">
              Order Summary
            </h3>
            <ul className="space-y-2 text-sm text-neutral-700">
              {cart.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {item.produce_name} × {item.quantity} {item.unit}
                  </span>
                  <span>
                    {(item.price_per_unit * item.quantity).toFixed(2)} Rwf
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-bold text-neutral-800">Total</span>
            <span className="text-xl font-bold text-green-600">
              {total.toFixed(2)} Rwf
            </span>
          </div>

          <div className="flex items-center gap-2 text-neutral-600 mt-4">
            <MapPin size={16} />
            <span>Hub: {hubId}</span>
          </div>

          {error && (
            <p className="text-red-600 text-sm">Error: {error.toString()}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-neutral-300 text-neutral-700 px-6 py-3 rounded-xl font-semibold hover:bg-neutral-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading || confirming}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading || confirming ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Processing...
              </>
            ) : (
              "Confirm Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
