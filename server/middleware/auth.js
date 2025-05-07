// // middleware/auth.js
// import jwt from "jsonwebtoken";

// export const authenticateUser = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   console.log("Authorization Header:", authHeader); // Debug log
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("Decoded Token:", decoded); // Debug log
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid Token" });
//   }
// };


// middleware/auth.js
// import jwt from 'jsonwebtoken';

// export const authenticateUser = (req, res, next) => {
//   try {
//     // Get token from Authorization header
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'Access denied. No token provided.' });
//     }
    
//     const token = authHeader.split(' ')[1];

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Add user data to request
//     req.user = {
//       userId: decoded.userId,
//       username: decoded.username,
//       email: decoded.email
//     };
    
//     next();
//   } catch (error) {
//     console.error('Authentication error:', error.message);
    
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ message: 'Token expired. Please login again.' });
//     }
//     return res.status(401).json({ message: 'Invalid token.' });
//   }
// };




// middleware/auth.js
import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request object with consistent property naming
    req.user = {
      id: decoded.userId, // Map userId to id for consistency
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email
    };
    
    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    
    return res.status(500).json({ message: "Server error during authentication" });
  }
};

// Optional: Add a middleware for verifying user ownership
export const verifyOwnership = (req, res, next) => {
  const { userId } = req.body;
  
  // Check if the user is modifying their own data
  if (userId !== req.user.userId) {
    return res.status(403).json({ message: "Forbidden: Cannot modify another user's data" });
  }
  
  next();
};