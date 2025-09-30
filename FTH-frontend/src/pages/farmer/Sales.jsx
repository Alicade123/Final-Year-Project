const sampleSales = [
  {
    id: 201,
    product: "Maize",
    qty: "50kg",
    amount: "$100",
    buyer: "Hotel Sunrise",
  },
  {
    id: 202,
    product: "Bananas",
    qty: "30kg",
    amount: "$60",
    buyer: "Retail Shop XYZ",
  },
];

export default function Sales() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Sales History</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-green-700 text-white">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Buyer</th>
              <th className="p-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sampleSales.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-3">{s.product}</td>
                <td className="p-3">{s.qty}</td>
                <td className="p-3">{s.buyer}</td>
                <td className="p-3">{s.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
