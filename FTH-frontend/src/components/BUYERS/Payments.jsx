export default function Payments() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Payments</h2>
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-600">
          Total Spent: <span className="font-bold">$1,200</span>
        </p>
        <p className="text-gray-600">
          Pending Payments: <span className="font-bold">$300</span>
        </p>
      </div>
    </div>
  );
}
