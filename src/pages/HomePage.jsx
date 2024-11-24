import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer"; // Import the Footer component
import { FaUserAlt, FaChartBar, FaFileInvoice, FaBoxes, FaMoneyCheckAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const Homepage = () => {
  const navigate = useNavigate(); // Navigation hook for redirection

  // Animation Variants
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="bg-gray-100">
      {/* Sticky Navbar */}
      <motion.header
        className="bg-white shadow-md sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
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
      </motion.header>

      {/* Hero Section with Parallax Effect */}
      <section
        className="relative bg-fixed bg-cover bg-center h-[500px]"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')", // Replace with your image
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center">
          <motion.div
            className="text-left text-white space-y-6 px-6 md:px-12 lg:ml-20"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-md">
              <p className="text-7xl font-semibold">WealthWare</p>
              <p className="text-blue-400 text-5xl">ERP Software</p>
            </h2>
            <p className="text-lg md:text-xl font-medium leading-relaxed drop-shadow-sm">
              Empowering Businesses, Simplifying Operations.
            </p>
            <p className="text-base md:text-lg leading-relaxed drop-shadow-sm">
              WealthWare ERP at Your Fingertips.
            </p>
            <motion.button
              onClick={() => navigate("/login")} // Redirect to login
              className="px-8 py-3 bg-white text-black text-lg font-medium rounded-md transition duration-300 ease-in-out shadow-lg text-left"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Get Started →
            </motion.button>
          </motion.div>
        </div>
        {/* SVG Curve */}
        <div className="absolute bottom-0 w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="w-full h-[100px]"
            preserveAspectRatio="none"
          >
            <path
              fill="#f3f4f6" // Background color of the next section
              d="M0,160L80,170.7C160,181,320,203,480,224C640,245,800,267,960,240C1120,213,1280,139,1360,101.3L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Info Cards Section */}
      <motion.section
        id="key-features"
        className="container mx-auto px-4 py-12"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Heading */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-800"
            variants={fadeIn}
          >
            Key Features
          </motion.h2>
          <motion.p className="text-gray-600 mt-2" variants={fadeIn}>
            Discover the powerful features of WealthWare ERP.
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="flex flex-col items-center space-y-8">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "User Friendly",
                description: "Easy-to-use interface designed to streamline operations for all users.",
                icon: <FaUserAlt className="text-blue-500 text-5xl mb-4" />,
              },
              {
                title: "Reports & Analytics",
                description: "Generate insightful reports and analyze your business performance.",
                icon: <FaChartBar className="text-green-500 text-5xl mb-4" />,
              },
              {
                title: "Invoice Generation",
                description: "Create professional invoices with ease and accuracy.",
                icon: <FaFileInvoice className="text-yellow-500 text-5xl mb-4" />,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white shadow-md rounded-md p-6 text-center hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-2"
              >
                <div className="flex justify-center items-center">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Second Row */}
          <div className="flex justify-center space-x-8">
            {[
              {
                title: "Inventory Management",
                description: "Manage your inventory seamlessly with real-time updates.",
                icon: <FaBoxes className="text-purple-500 text-5xl mb-4" />,
              },
              {
                title: "Expense Tracker",
                description: "Keep track of all your business expenses effortlessly.",
                icon: <FaMoneyCheckAlt className="text-red-500 text-5xl mb-4" />,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white shadow-md rounded-md p-6 text-center hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-2"
              >
                <div className="flex justify-center items-center">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Homepage;
