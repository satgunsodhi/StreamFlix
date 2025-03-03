import React from 'react';
import { Search, User } from 'lucide-react';

const Navbar = ({ searchQuery, onSearchChange }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">STREAMFLIX</div>
      <div className="navbar-right">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input 
            type="search" 
            className="search-bar" 
            placeholder="Search movies..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <User size={24} color="white" />
      </div>
    </nav>
  );
};

export default Navbar;