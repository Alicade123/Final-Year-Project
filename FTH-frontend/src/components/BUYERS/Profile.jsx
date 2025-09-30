export default function Profile() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Profile</h2>
      <div className="bg-white p-6 rounded-xl shadow space-y-3">
        <p>
          <span className="font-semibold">Name:</span> John Doe
        </p>
        <p>
          <span className="font-semibold">Email:</span> johndoe@example.com
        </p>
        <p>
          <span className="font-semibold">Company:</span> Sunrise Hotel
        </p>
        <button className="bg-green-700 text-white px-4 py-2 rounded-xl hover:bg-green-800">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
