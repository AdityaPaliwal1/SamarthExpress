import React, { useState, useEffect } from "react";
import { account } from "../appwrite";
import { Truck, Package, LogOut, X } from "lucide-react";
import Avatar from "react-avatar";

const Hero = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle OAuth Login
  const handleLogin = async () => {
    try {
      await account.createOAuth2Session(
        "google",
        "http://localhost:5173",
        "http://localhost:5173/fail"
      );
      fetchUserProfile(); // Fetch user profile after login
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
      await account.deleteSession("current");
      setUser(null); // Clear user data on logout
      setIsModalOpen(false);
      window.location.reload(); // Reload the page after logout
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  useEffect(() => {
    // Automatically fetch user data if logged in
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
            <span className="text-2xl font-bold text-white">
              Samarth Express
            </span>
          </div>
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
                href="#login"
                className="text-white hover:text-blue-400"
                onClick={handleLogin}
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
        </nav>
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

      {/* Modal */}
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
    </>
  );
};

export default Hero;
