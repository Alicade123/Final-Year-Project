export default function Payouts() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Payouts</h2>
      <div className="bg-white p-6 rounded-xl shadow space-y-3 max-w-md">
        <p>
          <span className="font-semibold">Total Earned:</span> $1,500
        </p>
        <p>
          <span className="font-semibold">Pending Payouts:</span> $400
        </p>
        <button className="bg-green-700 text-white px-4 py-2 rounded-xl hover:bg-green-800">
          Request Payout
        </button>
      </div>
    </div>
  );
}
