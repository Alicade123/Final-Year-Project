import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavLink = ({ to, children }) => {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded ${
        active ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  );
};

// export default function Navbar() {
//   return (
//     <header className="bg-white shadow-sm">
//       <div className="w-full px-6 py-3 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <div className="text-green-700 font-bold">
//             <Link to={"/"}>Farmers Trade Hub</Link>
//           </div>
//           <nav className="flex items-center gap-1">
//             <NavLink to="/clerk">Clerk</NavLink>
//             <NavLink to="/buyer">Buyer</NavLink>
//             <NavLink to="/farmer">Farmer</NavLink>
//           </nav>
//         </div>
//         <div className="text-sm text-gray-600">Ruhango District</div>
//       </div>
//     </header>
//   );
// }
