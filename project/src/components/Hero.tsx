import React, { useState, useEffect } from "react";
import { account } from "../appwrite";
import { Truck, Package, LogOut, X, Menu } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import Avatar from "react-avatar";
import { toast } from "react-toastify";
const Hero = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [LoginModal, setLoginModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state

  // Handle OAuth Login
  const handleLogin = async () => {
    try {
      await account.createOAuth2Session(
        "google",
        "http://localhost:5173",
        "http://localhost:5173/fail"
      );
      toast.success("Login successful!");
      fetchUserProfile();
    } catch (e) {
      console.error("Login failed:", e);
    }
  };

  // Fetch User Profile
  const fetchUserProfile = async () => {
    try {
      const userData = await account.get();
      setUser(userData); // Store user data in state
    } catch (e) {
      console.error("Failed to fetch user profile:", e);
    }
  };

  // Logout Functionality
  const handleLogout = async () => {
    try {
      await account.deleteSessions();
      toast.success("Logged out successfully!");
      setUser(null); // Clear user data on logout
      setIsModalOpen(false);
      window.location.reload(); // Reload the page after logout
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <>
      <header className="relative h-screen">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80"
            alt="Logistics Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Truck className="h-8 w-8 text-white" />
            <a href="/">
              <span className="text-2xl font-bold text-white">
                Samarth Express
              </span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <a href="#booking" className="text-white hover:text-blue-400">
              Book Parcel
            </a>
            <a href="#services" className="text-white hover:text-blue-400">
              Services
            </a>
            <a href="#contact" className="text-white hover:text-blue-400">
              Contact
            </a>
            {!user ? (
              <a
                className="text-white hover:bg-blue-600 cursor-pointer bg-blue-400 px-3 py-0.5 rounded"
                onClick={() => setLoginModal(true)}
              >
                Login
              </a>
            ) : (
              <div>
                <Avatar
                  name={user?.name || "Guest"}
                  size="30"
                  round={true}
                  className="cursor-pointer"
                  onClick={() => setIsModalOpen(true)}
                />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white "
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-8 w-8" />
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-0 left-0 w-full bg-black bg-opacity-50 md:hidden z-50 ">
            <div className="flex flex-col items-center py-6">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
              <a
                href="#booking"
                className="text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)} // Close mobile menu
              >
                Book Parcel
              </a>
              <a
                href="#services"
                className="text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)} // Close mobile menu
              >
                Services
              </a>
              <a
                href="#contact"
                className="text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)} // Close mobile menu
              >
                Contact
              </a>
              {!user ? (
                <a
                  className="text-white hover:bg-blue-600 cursor-pointer bg-blue-400 px-3 py-0.5 rounded"
                  onClick={() => setLoginModal(true)}
                >
                  Login
                </a>
              ) : (
                <div
                  className="text-white py-2"
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }} // Close menu and open profile modal
                >
                  <Avatar name={user?.name || "Guest"} size="30" round={true} />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Trusted Logistics Partner
          </h1>
          <p className="text-xl text-white mb-6 max-w-2xl">
            Delivering excellence across India with speed, reliability, and
            precision.
          </p>
          {user && (
            <div className="relative z-10 text-center text-white">
              <h2 className="text-2xl font-bold">Welcome, {user.name}!</h2>
            </div>
          )}
          <a
            href="#booking"
            className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition duration-300 flex items-center justify-center mt-6"
          >
            Book a Parcel{" "}
            <Package className="h-5 w-5 text-white ml-1 font-bold" />
          </a>
        </div>
      </header>

      {/* User Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              User Profile
            </h3>
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 flex items-center justify-center"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {LoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setLoginModal(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Sign In
            </h3>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-300"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-300 mt-2"
              />
            </div>
            <a href="#register" className="text-blue-500 hover:underline">
              <p className="text-center py-4">Don't have an Account?</p>
            </a>
            <button
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 flex items-center justify-center"
              onClick={handleLogin}
            >
              <FaGoogle className="h-5 w-5 mr-2" />
              Sign in with Google{" "}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Hero;
