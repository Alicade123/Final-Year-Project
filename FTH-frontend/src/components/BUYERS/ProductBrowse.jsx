import ProductCard from "./components/ProductCard";
import SearchBar from "./components/SearchBar";

const sampleProducts = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    price: 25,
    unit: "kg",
    image: "https://source.unsplash.com/400x300/?tomatoes",
  },
  {
    id: 2,
    name: "Organic Potatoes",
    price: 15,
    unit: "kg",
    image: "https://source.unsplash.com/400x300/?potatoes",
  },
  {
    id: 3,
    name: "Green Beans",
    price: 20,
    unit: "kg",
    image: "https://source.unsplash.com/400x300/?beans",
  },
];

export default function ProductBrowse() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Available Products</h2>
      <SearchBar placeholder="Search for fresh produce..." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {sampleProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
