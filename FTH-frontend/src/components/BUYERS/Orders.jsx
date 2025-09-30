import OrderCard from "./components/OrderCard";

const sampleOrders = [
  { id: 101, product: "Tomatoes", qty: "20kg", status: "Delivered" },
  { id: 102, product: "Potatoes", qty: "10kg", status: "Pending" },
];

export default function Orders() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Orders</h2>
      <div className="space-y-4">
        {sampleOrders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    </div>
  );
}
