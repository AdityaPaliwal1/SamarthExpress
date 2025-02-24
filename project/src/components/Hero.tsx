import React, { useState, useEffect } from "react";
import Avatar from "react-avatar";
import BgImage from "../../Background.png";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import "../index.css";
import { Truck, Package, LogOut, Menu } from "lucide-react";
import { toast } from "react-toastify";
import Booking from "./Booking";
import Services from "./Services";
import Contact from "./Contact";
import { FiRefreshCcw } from "react-icons/fi";

const Hero = () => {
  interface UserDetails {
    name: string;
    email: string;
    role: string;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Customer");
  const [isLogin, setLogin] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [RequestButton, setRequestButton] = useState(false);
  const [Pending, setPending] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get("jwt_token");
    if (token) {
      setLogin(true);
      const user = Cookies.get("user_details");
      if (user) {
        try {
          setUserDetails(JSON.parse(user)); // Safe parsing
        } catch (error) {
          console.error("Error parsing user details:", error);
        }
      }
    }
  }, [isLogin]);

  const handleLogout = () => {
    Cookies.remove("jwt_token");
    Cookies.remove("user_details"); // Remove user data from cookies
    setLogin(false); // Set login state to false
    setUserDetails(null);
    setProfileModalOpen(false);
    toast.success("Logged out successfully!");
  };

  // Login Handler
  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
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
        Cookies.set("jwt_token", data.token, { expires: 7 }); // Set JWT token in cookies
        Cookies.set("user_details", JSON.stringify(data.user), { expires: 7 }); // Set user details in cookies
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
      toast.error("Login Failed, Check Credentials ");
    }
  };

  // Register Handler
  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          role: role,
        }),
      });

      const data = await response.json();
      console.log("Registered data ", data);
      if (response.ok) {
        // Success: Notify user and reset fields
        toast.success("Register successful!");
        setEmail("");
        setPassword("");
        setName("");
        setRegisterModalOpen(false);
      } else {
        // Error: Notify user
        console.log(response);
        toast.error("Register failed, please try again.");
      }
    } catch (err) {
      toast.error("Failed , Check Credentials ");
    }
  };

  const handleAdminAccess = async () => {
    if (!name || !email) {
      toast.error("Fill all the Feilds");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:5000/api/send-email/toEnterprise",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Sent Request");
        setPending(true);
      }
    } catch (err) {
      toast.error("Failed");
    }
  };

  const checkApprovalStatus = async () => {
    if(!email){
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/send-email/check-approval?email=${email}`
      );
      const data = await response.json();
      if (data.approved) {
        setPending(false);
        setRequestButton(false);
        // Enable Register button
      }
    } catch (error) {
      console.error("Error checking approval:", error);
    }
  };

  useEffect(() => {
    if (role === "Admin" && email) {
      const interval = setInterval(checkApprovalStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [email, role]);

  return (
    <>
      <header className="relative h-screen">
        <div className="absolute inset-0">
          <img
            src={BgImage}
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
            {userDetails?.role === "Admin" ? (
              <a href="#booking" className="text-white hover:text-blue-400">
                Admin Reports
              </a>
            ) : userDetails?.role === "Customer" ? (
              <Link
                to="/user-reports"
                className="text-white hover:text-blue-400"
              >
                Reports
              </Link>
            ) : (
              <Link to="/" className="text-white hover:text-blue-400">
                Book Parcel
              </Link>
            )}
            <a href="#services" className="text-white hover:text-blue-400">
              Services
            </a>
            <a href="#contact" className="text-white hover:text-blue-400">
              Contact
            </a>
            {!isLogin ? (
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
                    name={userDetails?.name || "User"}
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
          {isLogin && userDetails && (
            <p className="text-2xl text-white font-bold ">
              Welcome , {userDetails.name}👋
            </p>
          )}
          {isLogin && userDetails?.role === "Admin" ? (
            <a
              href="#booking"
              className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition duration-300 flex items-center justify-center mt-6"
            >
              Go to Dashboard{" "}
              <Package className="h-5 w-5 text-white ml-1 font-bold" />
            </a>
          ) : (
            <a
              href="#booking"
              className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition duration-300 flex items-center justify-center mt-6"
            >
              Book Parcel{" "}
              <Package className="h-5 w-5 text-white ml-1 font-bold" />
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
            {userDetails?.role === "Admin" ? (
              <a href="#booking" className="text-white hover:text-blue-400">
                Admin Reports
              </a>
            ) : userDetails?.role === "Customer" ? (
              <Link
                to="/user-reports"
                className="text-white hover:text-blue-400"
              >
                Reports
              </Link>
            ) : (
              <Link to="/" className="text-white hover:text-blue-400">
                Book Parcel
              </Link>
            )}
            <a href="#services" className="text-white py-2">
              Services
            </a>
            <a href="#contact" className="text-white py-2">
              Contact
            </a>
            {!isLogin ? (
              <a
                className="text-white hover:bg-blue-600 cursor-pointer bg-blue-400 px-3 py-0.5 rounded mt-4"
                onClick={() => setIsModalOpen(true)}
              >
                Login
              </a>
            ) : (
              <div className="flex items-center space-x-2">
                <div>
                  <Avatar
                    name={userDetails?.name || "User"}
                    size="30"
                    round={true}
                    className="cursor-pointer"
                    onClick={() => setProfileModalOpen(true)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for Login */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-96">
            <div className="flex items-center">
              <button
                className="ml-auto text-gray-400"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <h2 className="text-2xl text-center font-bold mb-4">Login</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleLogin}
              className="w-full py-2 bg-blue-600 text-white rounded"
            >
              Login
            </button>
            <div className="mt-4 text-center">
              <span
                onClick={() => {
                  setRegisterModalOpen(true);
                  setIsModalOpen(false);
                }}
                className="text-blue-600 cursor-pointer"
              >
                Don't have an account? Register
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Register */}
      {registerModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-96">
            <div className="flex items-center">
              <button
                className="ml-auto text-gray-400"
                onClick={() => setRegisterModalOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <h2 className="text-2xl text-center font-bold mb-4">Register</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setRequestButton(e.target.value === "Admin");
              }}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            >
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>

            {RequestButton && (
              <button
                onClick={handleAdminAccess}
                className="p-1 mb-2"
                disabled={Pending}
              >
                {Pending ? (
                  <>
                    <span className="text-red-500">
                      Wait until the owner verifies you...
                    </span>
                  </>
                ) : (
                  <span className="text-green-500 underline">
                    Send Request for Admin access
                  </span>
                )}
              </button>
            )}

            <button
              onClick={handleRegister}
              className="w-full py-2 text-white rounded"
              style={{
                backgroundColor: RequestButton ? "gray" : "blue",
                cursor: RequestButton ? "not-allowed" : "pointer",
              }}
              disabled={RequestButton}
            >
              Register
            </button>

            <div className="mt-4 text-center">
              <span
                onClick={() => {
                  setRegisterModalOpen(false);
                }}
                className="text-blue-600 cursor-pointer"
              >
                Already have an account? Login
              </span>
            </div>
          </div>
        </div>
      )}

      {profileModalOpen && (
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
            <div className="flex justify-center items-center mb-4">
              <Avatar
                name={userDetails?.name || "User"}
                size="60"
                round={true}
                className="cursor-pointer"
                onClick={() => setProfileModalOpen(true)}
              />
            </div>
            <div className="flex gap-2">
              <span>Name:</span>
              <p className="font-bold">{userDetails?.name}</p>
            </div>
            <div className="flex gap-2">
              <span>Email:</span>
              <p className="font-bold">{userDetails?.email}</p>
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
      <Booking userRole={userDetails?.role || "Customer"} />
      <Services />
      <Contact />
    </>
  );
};

export default Hero;
