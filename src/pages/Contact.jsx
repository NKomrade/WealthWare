import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer"; // Assuming Footer is a shared component
import { motion } from "framer-motion";

const Contact = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="hover:no-underline">
            <div className="flex items-center space-x-1 cursor-pointer">
              <img
                src="/Logo.png" // Ensure the file is in the 'public' folder
                alt="Logo"
                className="h-10"
              />
              <h1
                className="text-0.5xl md:text-3xl font-bold text-black tracking-wide drop-shadow-lg"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                ealthWare
              </h1>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex justify-end space-x-4">
            <Link to="/about" className="text-black hover:font-semibold hover:no-underline">
              About
            </Link>
            <Link to="/contact" className="text-black hover:font-semibold hover:no-underline">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <motion.div
        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-16"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg md:text-xl">
            Let’s get in touch. We are here to help and answer any questions you might have.
          </p>
        </div>
      </motion.div>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            className="bg-white shadow-lg rounded-md p-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-400"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-400"
                  placeholder="Your Email"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-400"
                  rows="5"
                  placeholder="Your Message"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Send Message
              </button>
            </form>
          </motion.div>

          {/* Contact Details */}
          <motion.div
            className="flex flex-col justify-center bg-gradient-to-r from-blue-100 to-blue-200 p-8 rounded-md shadow-md"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
            <ul className="space-y-6">
              <li className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full">
                  📍
                </div>
                <div>
                  <p className="text-gray-800 font-medium">North Campus</p>
                  <p className="text-gray-600">New Delhi, India</p>
                </div>
              </li>
              <li className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full">
                  📞
                </div>
                <div>
                  <p className="text-gray-800 font-medium">011 4023 0921</p>
                  <p className="text-gray-600">Mon - Fri, 9am - 6pm</p>
                </div>
              </li>
              <li className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full">
                  ✉️
                </div>
                <div>
                  <p className="text-gray-800 font-medium">info@wealthware.com</p>
                  <p className="text-gray-600">We reply within 24 hours</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;