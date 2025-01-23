import React from "react";
import { ToastContainer } from "react-toastify";
import Hero from "./components/Hero";
import Booking from "./components/Booking";
import Services from "./components/Services";
import Contacts from "./components/Contact";
import Footer from "./Layouts/Footer";

function App() {
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
