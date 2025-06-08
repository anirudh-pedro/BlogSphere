import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/nav.css';
import BlogLogo from '../assets/images/Logo.png';
import profileImg from '../assets/images/profile.png';
import { SlNote } from "react-icons/sl";
import { IoIosNotificationsOutline, IoIosSearch } from "react-icons/io";
import { HiMenu, HiX } from "react-icons/hi";
import { API_BASE_URL } from '../config/api';

const Nav = ({ user }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const handleWriteClick = () => {
    navigate('/write');
  };

  // Close mobile menu when screen resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Handle search functionality
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search functionality
  // Search functionality


   // Update your handleSearch function with better error handling
const handleSearch = async (e) => {
  const term = e.target.value;
  setSearchTerm(term);

  // Clear results if search term is too short
  if (term.length < 2) {
    setSearchResults([]);
    setShowSearchResults(false);
    return;
  }

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("No access token found");
      return;
    }

    console.log(`Searching for: "${term}" at ${API_BASE_URL}/api/blogs/search`);
    
    const response = await fetch(`${API_BASE_URL}/api/blogs/search?term=${encodeURIComponent(term)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Search failed with status ${response.status}: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log('Search results received:', data);
    
    setSearchResults(data);
    setShowSearchResults(true);
  } catch (error) {
    console.error("Search error:", error);
  }
};

  const handleSearchResultClick = (blogId) => {
    setShowSearchResults(false);
    navigate(`/blogs/${blogId}`);
  };

  return (
    <nav className="nav-container">
      {/* Left Section - Logo and Search */}
      <div className="logoSearch">
        <div className="logoImg">
          <Link to="/"><img src={BlogLogo} alt="Blog Logo" /></Link>
        </div>
        <div className="inputSearch" ref={searchRef}>
  <IoIosSearch className="searchIcon" />
  <input 
    type="text" 
    placeholder="Search topics or authors" 
    value={searchTerm}
    onChange={handleSearch}
    className="search-input" 
  />
  {showSearchResults && (
    <div className="search-results">
      {searchResults.length > 0 ? (
        searchResults.map(blog => (
          <div 
            key={blog._id} 
            className="search-result-item"
            onClick={() => handleSearchResultClick(blog._id)}
          >
            <div className="search-result-title">{blog.title}</div>
            <div className="search-result-info">
              <span className="search-topic">{blog.topic || "Uncategorized"}</span>
              <span className="search-author">By: {blog.author?.username || "Unknown"}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="no-results">No matching blogs found</div>
      )}
    </div>
  )}
</div>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <HiX /> : <HiMenu />}
      </div>

      {/* Right Section - Signup/Signin or User Info */}
      <div className={`writeNotifyProfile ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        {!user ? (
          <div className="signUpIn">
            <Link to="/Signup">
              <div className="signUp">
                <button>Sign Up</button>
              </div>
            </Link>
            <Link to="/Signin">
              <div className="signIn">
                <button>Sign In</button>
              </div>
            </Link>
          </div>
        ) : (
          <>
            {/* Write Button */}
            <div className="write" onClick={handleWriteClick}>
              <SlNote className="writeIcon" />
              <h4>Write</h4>
            </div>

            {/* Notification Icon */}
            <div className="notification">
              <IoIosNotificationsOutline className="notificationIcon" />
            </div>

            {/* Username Display */}
            <span className="username">{user.username}</span>

            {/* Profile Image (Redirects to Userinfo) */}
            <div className="profile">
              <Link to="/Userinfo">
                <img src={profileImg} className="profileUser" alt="Profile" />
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;