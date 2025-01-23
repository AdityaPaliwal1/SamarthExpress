import React from "react";

import { Truck, Package } from "lucide-react";
const Hero = () => {
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
            <a href="#about" className="text-white hover:text-blue-400">
              About
            </a>
            <a href="#contact" className="text-white hover:text-blue-400">
              Contact
            </a>
          </div>
        </nav>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Trusted Logistics Partner
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl">
            Delivering excellence across India with speed, reliability, and
            precision.
          </p>
          <a
            href="#booking"
            className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            Book a Parcel <Package className="h-5 w-5 text-white ml-1" />
          </a>
        </div>
      </header>
    </>
  );
};

export default Hero;
