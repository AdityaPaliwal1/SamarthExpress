import { Truck } from 'lucide-react'
import React from 'react'

const Footer = () => {
  return (
    <>
    <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Truck className="h-6 w-6" />
            <span className="text-xl font-bold text-white">
              Samarth Express
            </span>
          </div>
          <p>© 2024 Samarth Express. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}

export default Footer