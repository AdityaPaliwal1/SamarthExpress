import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Hero from "./components/Hero";
// import Booking from "./components/Booking";

import UserReports from "./components/UserReports";
import Footer from "./Layouts/Footer";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div> */}
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/user-reports" element={<UserReports />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
