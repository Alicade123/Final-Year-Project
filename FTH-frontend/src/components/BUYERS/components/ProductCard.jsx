import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600">
          Price: ${product.price}/{product.unit}
        </p>
        <button className="mt-3 flex items-center justify-center w-full bg-green-700 text-white py-2 rounded-xl hover:bg-green-800">
          <ShoppingCart size={16} className="mr-2" /> Add to Cart
        </button>
      </div>
    </div>
  );
}
