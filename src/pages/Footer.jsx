import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* About Section */}
        <div className="text-center md:text-left">
          <h4 className="text-lg font-semibold">About WealthWare</h4>
          <p className="text-sm mt-2">
            Empowering businesses with ERP solutions tailored to streamline
            processes and enhance productivity.
          </p>
        </div>

        {/* Social Media Links */}
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-white"
          >
            <i className="fab fa-facebook-f"></i> Facebook
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-white"
          >
            <i className="fab fa-twitter"></i> Twitter
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-white"
          >
            <i className="fab fa-linkedin"></i> LinkedIn
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 hover:text-white"
          >
            <i className="fab fa-instagram"></i> Instagram
          </a>
        </div>

        {/* Copyright */}
        <div className="mt-4 md:mt-0 text-sm text-center md:text-right">
          © {new Date().getFullYear()} WealthWare. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;