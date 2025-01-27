import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Hero from "./components/Hero";
import Booking from "./components/Booking";
import Services from "./components/Services";
import Contacts from "./components/Contact";
import Footer from "./Layouts/Footer";

function App() {

  const[loading, setLoading] = useState(true);

   useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
      
    }, []);

    if(loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          {/* <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div> */}
          <div className="loader"></div>
        </div>
      );
    }
    
  return (
    <div className="min-h-screen bg-white">
      {/* To run the toast notifications */}
      <ToastContainer />
      {/* Hero Section */}
      <Hero />

      {/* Booking Section */}
      <Booking />

      {/* Services Section */}
      <Services />

      {/* Contact Section */}

      <Contacts />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
