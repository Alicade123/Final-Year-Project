import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (token && role) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role);

      // Redirect by role
      switch (role) {
        case "BUYER":
          navigate("/buyer");
          break;
        case "CLERK":
          navigate("/clerk");
          break;
        case "FARMER":
          navigate("/farmer");
          break;
        case "ADMIN":
          navigate("/admin");
          break;
        default:
          navigate("/");
      }
    } else {
      navigate("/"); // fallback if token or role missing
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-gray-700">Logging you in...</p>
      </div>
    </div>
  );
}
