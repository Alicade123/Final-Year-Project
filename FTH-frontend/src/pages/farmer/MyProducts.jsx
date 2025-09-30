import ProductCard from "./components/ProductCard";

const sampleProducts = [
  {
    id: 1,
    name: "Maize",
    price: 20,
    unit: "kg",
    image: "https://source.unsplash.com/400x300/?maize",
  },
  {
    id: 2,
    name: "Bananas",
    price: 10,
    unit: "kg",
    image: "https://source.unsplash.com/400x300/?bananas",
  },
];

export default function MyProducts() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
