// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6">
      <div className="text-2xl font-bold">YourName</div>
      <div className="space-x-4">
        <Link to="/" className="hover:text-gray-500">Home</Link>
        <Link to="/about" className="hover:text-gray-500">About</Link>
        <Link to="/projects" className="hover:text-gray-500">Projects</Link>
        <Link to="/contact" className="hover:text-gray-500">Contact</Link>
      </div>
    </nav>
  );
}

export default Navbar;