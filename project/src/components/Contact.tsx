import { Clock, Mail, Phone } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'react-toastify';

const Contact = () => {

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

     const Sendmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !email || !message) {
          return toast.error("Please fill all the fields"); 
        }

        const response = await fetch("https://samarthexpress.onrender.com/api/send-email/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            email: email,
            message: message,
          }),
        });
    
        const result = await response.json();
        if (response.ok) {
          toast.success("Email sent Successfully ✅") // Success message from backend
          setName(""); // Clear form
          setEmail("");
          setMessage("");
        } else {
          toast.error(result.message || "Failed to send your message. Please try again later."); }
      };
      
  return (
    <>
    <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Phone className="h-6 w-6" />
                  <span>+91 1234567890</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6" />
                  <span>contact@samarthexpress.com</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="h-6 w-6" />
                  <span>24/7 Customer Support</span>
                </div>
              </div>
            </div>
            <form className="space-y-4" method="POST">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
              ></textarea>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300"
                onClick={Sendmail}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="w-full mt-2 p-4">
      <iframe
        title="Samarth Express Location"
        className="w-full h-[600px] border-0"
        scrolling="no"
        src="https://maps.google.com/maps?width=100%25&amp;height=300&amp;hl=en&amp;q=Samarth%20Express+(Samarth%20Express)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
        allowFullScreen
      ></iframe>
    </div>
      </section>
    </>
  )
}

export default Contact