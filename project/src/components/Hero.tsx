import React, { useState, useEffect } from "react";
import Avatar from "react-avatar";
import { FaGoogle } from "react-icons/fa";
import { X } from "lucide-react";
import "../index.css";
import { Truck, Package, LogOut, Menu } from "lucide-react";
import { toast } from "react-toastify";
import Booking from "./Booking";
const Hero = () => {
  interface UserDetails {
    name: string;
    email: string;
    role : string;
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Customer");
  const [islogin, setLogin] = useState(false);
  const [userdetails, setUserDetails] = useState<UserDetails | null>(null);
  const [ProfileModalOpen, setProfileModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      setLogin(true);
      const user = localStorage.getItem("user_details");
      if (user) {
        try {
          setUserDetails(JSON.parse(user)); // Safe parsing
        } catch (error) {
          console.error("Error parsing user details:", error);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_details"); // Remove token from localStorage
    setLogin(false); // Set login state to false
    setUserDetails(null);
    setProfileModalOpen(false);
    toast.success("Logged out successfully!");
  };
  //  Login Handler
  const handleLogin = async () => {
    try {
      const response = await fetch("https://samarthexpress.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      console.log("login data ", data);

      if (response.ok) {
        // Success: Notify user and reset fields
        localStorage.setItem("jwt_token", data.token);
        localStorage.setItem("user_details", JSON.stringify(data.user)); // Store user details
        setUserDetails(data.user); // Update state with user details
        toast.success("Login successful!");
        setEmail("");
        setPassword("");
        setLogin(true);
        setIsModalOpen(false);
      } else {
        // Error: Notify user
        toast.error("Login failed, please try again.");
      }
    } catch (error) {
      // Handle any network or server errors
      toast.error("Login Failed , Check Credentials ");
    }
  };

  // Register Handler
  const handleRegister = async () => {
    try {
      const response = await fetch("https://samarthexpress.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          role: role,
        }),
      });

      if (response.ok) {
        // Success: Notify user and reset fields
        toast.success("Register successful!");
        setEmail("");
        setPassword("");
        setName("");

        setRegisterModalOpen(false);
      } else {
        // Error: Notify user
        toast.error("Register failed, please try again.");
      }
    } catch (e) {
      toast.error("Failed , Check Credentials ");
    }
  };

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
            <a href="/#">
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
            {!islogin ? (
              <a
                className="text-white hover:bg-blue-600 cursor-pointer bg-blue-400 px-3 py-0.5 rounded"
                onClick={() => setIsModalOpen(true)}
              >
                Login
              </a>
            ) : (
              <div className="flex items-center space-x-2">
                <div>
                  <Avatar
                    name={userdetails?.name || "User"}
                    size="30"
                    round={true}
                    className="cursor-pointer"
                    onClick={() => setProfileModalOpen(true)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <Menu className="hidden" />
            ) : (
              <Menu className="h-8 w-8" />
            )}
          </button>
        </nav>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Trusted Logistics Partner
          </h1>
          <p className="text-xl text-white mb-6 max-w-2xl">
            Delivering excellence across India with speed, reliability, and
            precision.
          </p>
          {islogin && userdetails && (
            <p className="text-2xl text-white font-bold ">
              Welcome , {userdetails.name}👋
            </p>
          )}
        {islogin && userdetails?.role === "Admin" ? (
    <a
    href="#booking" // Replace with the actual link to the admin dashboard
    className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition duration-300 flex items-center justify-center mt-6"
  >
    Go to Dashboard <Package className="h-5 w-5 text-white ml-1 font-bold" />
  </a>
  ) : (
      <a
        href="#booking" // Replace with the actual link to the admin dashboard
        className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition duration-300 flex items-center justify-center mt-6"
      >
        Book Parcel <Package className="h-5 w-5 text-white ml-1 font-bold" />
      </a>    
  )}
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-0 left-0 w-full bg-black bg-opacity-50 md:hidden z-50 ">
          <div className="flex flex-col items-center py-6">
            <button
              className="absolute top-4 right-4 text-gray-400 "
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-8 w-8" />
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
            {!islogin ? (
              <a
                className="text-white hover:bg-blue-600 cursor-pointer bg-blue-400 px-3 py-0.5 rounded"
                onClick={() => setIsModalOpen(true)}
              >
                Login
              </a>
            ) : (
              <div className="flex items-center space-x-2">
               <div>
                  <Avatar
                    name={userdetails?.name || "User"}
                    size="30"
                    round={true}
                    className="cursor-pointer"
                    onClick={() => setProfileModalOpen(true)}
                  />
                </div>
              </div>
            )}

            <div
              className="text-white py-2"
              onClick={() => {
                setIsModalOpen(true);
                setIsMobileMenuOpen(false);
              }} // Close menu and open profile modal
            ></div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsModalOpen(false)} // Close modal
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Sign In
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-300"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              >
                Log in
              </button>
            </form>

            <a
              className="cursor-pointer"
              onClick={() => {
                setIsModalOpen(false); // Close the login modal
                setRegisterModalOpen(true); // Open the register modal
              }}
            >
              <p className="text-blue-300 text-center mt-2">
                Dont have an account?
              </p>
            </a>
            <div className="text-center py-4">
              <button className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 flex items-center justify-center">
                <FaGoogle className="h-5 w-5 mr-2" />
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}

      {registerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setRegisterModalOpen(false)} // Close modal
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Register
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
            >
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-300"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-300"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-300"
                  required
                />
              </div>
              <div className="mb-4">
                <select
                  name="Role"
                  value={role} // Bind to the state
                  onChange={(e) => setRole(e.target.value)} // Update state on change
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-300"
                >
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ProfileModal */}

      {ProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setProfileModalOpen(false)} // Close modal
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center  text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
               User Profile
            </h3>
            <div className="flex gap-2">
              <span>Name:</span>
              <p className="font-bold">{userdetails?.name}</p>
            </div>
            <div className="flex gap-2">
              <span>Email:</span>
              <p className="font-bold">{userdetails?.email}</p>
            </div>
            <div>
            <button
              className="w-full bg-blue-500 text-white px-4 py-2 mt-3 rounded hover:bg-blue-600 transition duration-300 flex items-center justify-center"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
            </div>
          </div>
        </div>
      )}
     <Booking userRole={userdetails?.role || "Customer"} />
    </>
  );
};

export default Hero;