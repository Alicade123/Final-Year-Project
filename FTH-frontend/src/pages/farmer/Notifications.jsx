const sampleNotifs = [
  { id: 1, message: "Your product 'Maize' has been ordered by Hotel Sunrise." },
  { id: 2, message: "Payment of $200 has been processed." },
];

export default function Notifications() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      <div className="space-y-3">
        {sampleNotifs.map((n) => (
          <div
            key={n.id}
            className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded"
          >
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
}
