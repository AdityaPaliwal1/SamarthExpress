import { FiTruck } from "react-icons/fi";
import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="bg-navbar text-gray-400 py-5 ">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FiTruck className="h-6 w-6 text-white" />
            <span className="text-xl font-bold text-white">
              Samarth Express
            </span>
          </div>
          <p>© 2025 Samarth Express. All rights reserved.</p>
          <span>
            <b>Made with 💖 by Aditya Paliwal</b>
          </span>
        </div>
      </footer>
    </>
  );
};

export default Footer;
