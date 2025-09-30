export default function AddProduct() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add New Product</h2>
      <form className="bg-white p-6 rounded-xl shadow space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Product Name"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Price per unit"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Unit (e.g., kg, ton)"
          className="w-full border p-2 rounded"
        />
        <input type="file" className="w-full border p-2 rounded" />
        <button className="bg-green-700 text-white px-4 py-2 rounded-xl hover:bg-green-800 w-full">
          Save Product
        </button>
      </form>
    </div>
  );
}
