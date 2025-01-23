import React from 'react';
import { Truck, Package, Globe, Shield, BarChart3, Users, Clock ,} from "lucide-react";

const Services = () => {
    return (
        <>
        <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Truck className="h-12 w-12 text-blue-600" />,
                title: "Road Transportation",
                description:
                  "Nationwide coverage with our modern fleet of trucks",
              },
              {
                icon: <Package className="h-12 w-12 text-blue-600" />,
                title: "Warehousing",
                description: "Secure storage solutions across major cities",
              },
              {
                icon: <Globe className="h-12 w-12 text-blue-600" />,
                title: "Express Delivery",
                description:
                  "Time-sensitive deliveries with real-time tracking",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg shadow-lg text-center"
              >
                <div className="flex justify-center mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Why Choose Samarth Express
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-blue-600" />,
                title: "Reliable",
                description: "99.9% on-time delivery",
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
                title: "Efficient",
                description: "Optimized routes & costs",
              },
              {
                icon: <Users className="h-8 w-8 text-blue-600" />,
                title: "Expert Team",
                description: "Experienced professionals",
              },
              {
                icon: <Clock className="h-8 w-8 text-blue-600" />,
                title: "24/7 Support",
                description: "Always here to help",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
        </>
    )
}

export default Services;
