import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer"; // Assuming you have a Footer component
import { motion } from "framer-motion";

const About = () => {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const teamMemberFade = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
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
        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-16"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">About Us</h1>
          <p className="text-lg md:text-xl">
            Empowering businesses with cutting-edge ERP solutions tailored to your needs.
          </p>
        </div>
      </motion.div>

      {/* Vision and Mission Section */}
      <section className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          className="p-6 bg-white shadow-md rounded-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Our Vision</h2>
          <p className="text-gray-700">
            To be the leading ERP solution provider, empowering businesses to achieve operational excellence.
          </p>
        </motion.div>
        <motion.div
          className="p-6 bg-white shadow-md rounded-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Our Mission</h2>
          <p className="text-gray-700">
            Deliver seamless, user-friendly software that simplifies business processes and boosts productivity.
          </p>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-200">
        <div className="container mx-auto px-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Meet the Team</h2>
          <p className="text-gray-600 mt-2">
            Our dedicated professionals working to bring you the best.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 lg:px-12">
          {[
            { name: "Kanwaljot Singh", image: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortCurly&accessoriesType=Prescription01&hairColor=Black&facialHairType=BeardLight&facialHairColor=Black&clotheType=Hoodie&clotheColor=Blue01&eyeType=Default&eyebrowType=Default&mouthType=Smile&skinColor=Light" },
            { name: "Nitin Kumar Singh", image: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairDreads01&accessoriesType=Prescription02&hairColor=Brown&facialHairType=MoustacheMagnum&facialHairColor=Brown&clotheType=BlazerSweater&eyeType=Wink&eyebrowType=RaisedExcited&mouthType=Twinkle&skinColor=Brown" },
            { name: "Siddharth",image: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Blank&hairColor=Brown&facialHairType=MoustacheMagnum&facialHairColor=Brown&clotheType=ShirtScoopNeck&clotheColor=PastelBlue&eyeType=Wink&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Light"},
            { name: "Shweta Sharma", image: "https://avataaars.io/?avatarStyle=Circle&topType=LongHairCurly&accessoriesType=Kurt&hairColor=Black&facialHairType=Blank&clotheType=Overall&clotheColor=PastelBlue&eyeType=Happy&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Light" },
            { name: "Shantanu Pandey", image: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairSides&accessoriesType=Sunglasses&hairColor=Black&facialHairType=Blank&clotheType=BlazerShirt&clotheColor=Black&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Brown" },
          ].map((member, index) => (
            <motion.div
              className="flex flex-col items-center"
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={teamMemberFade}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <h3 className="text-xl font-bold">{member.name}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Us Today</h2>
          <p className="text-lg md:text-xl mb-8">
            Experience the power of WealthWare ERP for your business.
          </p>
          <button
            onClick={() => navigate("/login")} // Redirect to /login
            className="btn btn-primary shadow-lg"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;