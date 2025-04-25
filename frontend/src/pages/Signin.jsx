import { Link, useNavigate } from 'react-router-dom';
import '../styles/signin.css';
import React, { useState } from 'react';
import { CgMail } from "react-icons/cg";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import googleLogo from '../assets/images/google-logo.png';
import Swal from 'sweetalert2'; 
import AnimationWrapper from '../components/AnimationWrapper';

const Signin = ({ setUser }) => {
  const [showPass, setPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const togglePasswordVisibility = (event) => {
    event.preventDefault();  
    setPass(!showPass);
  };

  const handleSignin = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch('http://localhost:5000/api/users/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // ✅ This is needed to send cookies
      });
      
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid credentials");
      }
  
      const data = await response.json();
      console.log("Login Response Data:", data); // ✅ Debugging step
  
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: `Welcome back, ${data.username}!`,
        timer: 2000,
        showConfirmButton: true
      });
  
      // ✅ Store user info correctly in localStorage
      const userData = { userId: data.userId, username: data.username, token: data.token };
      localStorage.setItem("user", JSON.stringify(userData));
  
      // ✅ Update state with user details
      setUser(userData);
  
      // ✅ Redirect to homepage
      navigate('/');   
  
    } catch (error) {
      console.error("Signin error:", error);
  
      if (error.message.includes("Failed to fetch")) {
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: 'Server is down or unreachable. Please try again later!',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: error.message,
        });
      }
    }
  };
  
  

  return (
    <AnimationWrapper>
      <div className="signin-container-out">
        <div className="signin-container">
          <h2 className='sign-head'>Sign In</h2>
          <form className='content-form-in' onSubmit={handleSignin}>
            <div className='email-relative'>
              <label htmlFor='email'>Email</label>
              <CgMail className='email-icon' />
              <input 
                type="email" 
                name="email" 
                id="email" 
                placeholder='Enter your email' 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className='pass-relative'>
              <label>Password</label>
              <RiLockPasswordLine className='pass-icon' />
              <input 
                type={showPass ? "text" : "password"} 
                name="password" 
                id="password" 
                placeholder='Enter your password' 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={togglePasswordVisibility}>
                {showPass ? <FaRegEye className='eyeOpen' /> : <FaRegEyeSlash className='eyeClose' />}
              </button>
            </div>
            <button type="submit" className="submit-btn">Sign In</button>
            <div className="flex items-center gap-1.5 justify-center">
              <hr className='w-1/2' />
              <p>or</p>
              <hr className='w-1/2' />
            </div>
            <div className="google-signup">
              <button className='flex items-center justify-center cursor-pointer gap-1'>
                <img src={googleLogo} className='w-5.5' alt="Google Logo" />
                Continue with Google
              </button>
            </div>
          </form>
          <div className="switch-form">
            <p>Don't have an account? <Link to="/Signup" className='page-change'>Sign Up</Link></p>
          </div>
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default Signin;
