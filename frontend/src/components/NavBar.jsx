import { FaMicrophoneAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in (you can use your own authentication logic)
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    // Remove authentication token
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    // Navigate to home page
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <nav className="fixed top-0 left-0 z-50 md:p-9 p-5 w-full flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FaMicrophoneAlt className="text-purple-500 md:text-3xl text-2xl" />
        <span className="text-white font-bold md:text-2xl text-xl tracking-tight">
          VOCALAURA
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
