import React from "react";
import { easeIn, motion } from "framer-motion";
import Truck from "../../truck.png";
import Warehouse from "../../warehouse (2).jpg";
import Delivery from "../../express.png";
import { FiBarChart, FiClock, FiShield, FiUsers } from "react-icons/fi";

const Services = () => {
  const animations = {
    div: {
      initial: {
        y: "70%",
        opacity: 0,
      },
      whileInView: {
        y: "0",
        opacity: 1,
      },
      transition: {
        duration: 0.5,
        easeIn,
      },
    },
  };

  return (
    <>
      <section id="services" className="py-20 bg-white">
        <motion.div {...animations.div}>
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-tabColor mb-16">
              Our Services
            </h2>
            <div className="grid md:grid-cols-3 gap-8 place-items-center ">
              {[
                {
                  img: Truck,
                  title: "Road Transportation",
                  description:
                    "Nationwide coverage with our modern fleet of trucks",
                },
                {
                  img: Warehouse,
                  title: "Warehousing",
                  description: "Secure storage solutions across major cities",
                },
                {
                  img: Delivery,
                  title: "Express Delivery",
                  description:
                    "Time-sensitive deliveries with real-time tracking",
                },
              ].map((service, index) => (
                <div
                  key={index}
                  className=" p-7 max-h-45 rounded-lg shadow-lg text-center relative w-[300px] h-[320px] rounded-[14px]  overflow-hidden flex flex-col items-center justify-center shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] "
                >
                  <div className="bg">
                    <div className="text-gray-50">
                      <img
                        src={service.img}
                        alt={service.title}
                        className={
                          index == 0
                            ? "h-25 w-45 mx-auto mb-10"
                            : index == 2
                            ? "h-25 w-45 mx-auto"
                            : "h-25 w-45 mx-auto mb-6 "
                        }
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                  <div className="blob"></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Why Choose Samarth Express
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <FiShield className="h-8 w-8 text-iconColor" />,
                title: "Reliable",
                description: "99.9% on-time delivery",
              },
              {
                icon: <FiBarChart className="h-8 w-8 text-iconColor" />,
                title: "Efficient",
                description: "Optimized routes & costs",
              },
              {
                icon: <FiUsers className="h-8 w-8 text-iconColor" />,
                title: "Expert Team",
                description: "Experienced professionals",
              },
              {
                icon: <FiClock className="h-8 w-8 text-iconColor" />,
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
  );
};

export default Services;
