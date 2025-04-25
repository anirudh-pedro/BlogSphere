import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/signup.css';
import AnimationWrapper from '../components/AnimationWrapper';
import googleLogo from '../assets/images/google-logo.png';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onValue = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const validateForm = () => {
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]{2,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    let newErrors = { username: false, email: false, password: false, confirmPassword: false };

    if (!usernameRegex.test(formData.username)) newErrors.username = true;
    if (!emailRegex.test(formData.email)) newErrors.email = true;
    if (!passwordRegex.test(formData.password)) newErrors.password = true;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = true;

    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const signUpSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Signup successful!');
        navigate('/signin');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  return (
    <AnimationWrapper>
      <div className="signup-container-out">
        <div className="signup-container">
          <h2 className="sign-head">Sign Up</h2>
          <form onSubmit={signUpSubmit} className="content-form-up">
            <div>
              <label htmlFor="username">UserName</label>
              <input type="text" name="username" id="username" value={formData.username} onChange={onValue} placeholder="Enter your Name" required />
              {errors.username && <p className="error-text">Username must be 3-15 characters (letters & numbers only).</p>}
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={onValue} placeholder="Enter your email" required />
              {errors.email && <p className="error-text">Invalid email format.</p>}
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input type="password" name="password" id="password" value={formData.password} onChange={onValue} placeholder="Enter your password" required />
              {errors.password && <p className="error-text">Password must include uppercase, lowercase, number, and special character.</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={onValue} placeholder="Confirm your password" required />
              {errors.confirmPassword && <p className="error-text">Passwords do not match.</p>}
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
            <div className="hr-or flex items-center gap-1.5 justify-center">
              <hr className="w-1/2" />
              <p>or</p>
              <hr className="w-1/2" />
            </div>
            <div className="google-signup">
              <button className="flex items-center justify-center cursor-pointer gap-1">
                <img src={googleLogo} className="w-5.5" alt="Google Logo" />
                Continue with Google
              </button>
            </div>
          </form>
          <div className="switch-form">
            <p>Already have an account? <Link to="/signin" className="page-change">Sign In</Link></p>
          </div>
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default Signup;
