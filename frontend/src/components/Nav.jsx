import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/nav.css';
import BlogLogo from '../assets/images/Logo.png';
import profileImg from '../assets/images/profile.png';
import { SlNote } from "react-icons/sl";
import { IoIosNotificationsOutline, IoIosSearch } from "react-icons/io";

const Nav = ({ user }) => {
  const navigate = useNavigate();

  const handleWriteClick = () => {
    navigate('/write');
  };

  return (
    <nav>
      {/* Left Section - Logo and Search */}
      <div className="logoSearch">
        <div className="logoImg">
          <Link to="/"><img src={BlogLogo} alt="Blog Logo" /></Link>
        </div>
        <div className="inputSearch">
          <IoIosSearch className="searchIcon" />
          <input type="text" placeholder="Search" className="" />
        </div>
      </div>

      {/* Right Section - Signup/Signin or User Info */}
      <div className="writeNotifyProfile">
        {!user ? (
          <div className="signUpIn">
            <Link to="/Signup" className="hidden lg:block">
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
            <div className="hidden lg:block write" onClick={handleWriteClick}>
              <SlNote className="writeIcon" />
              <h4>Write</h4>
            </div>

            {/* Notification Icon */}
            <div className="hidden sm:block notification">
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
