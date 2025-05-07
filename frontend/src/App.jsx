import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import WriteArticle from "./pages/WriteArticle";
import EditBlog from "./pages/EditBlog";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import BlogDetail from "./pages/BlogDetails";
import Userinfo from "./pages/Userinfo";
import NotFound from "./pages/NotFound";
import activityTracker from "./utils/activityTracker";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase(); // normalize path

  // Initialize activity tracker when user logs in
  useEffect(() => {
    const fetchUser = () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        if (loggedInUser) {
          setUser(loggedInUser);
          
          // Initialize activity tracker with user token and debug mode
          if (loggedInUser.token) {
            activityTracker.init(loggedInUser.token, {
              debugMode: true, // Enable debug mode to help diagnose issues
              retryAttempts: 3,  // Number of retry attempts for failed requests
              retryDelay: 2000   // Delay between retries in milliseconds
            });
          }
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        // Handle invalid stored data by clearing it
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    // Add listener for activity tracker auth errors
    const handleAuthError = () => {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser && currentUser.token) {
        activityTracker.init(currentUser.token);
      } else {
        // If no valid user data is found, redirect to signin
        handleLogout();
      }
    };

    window.addEventListener('activity-tracker-auth-error', handleAuthError);
    fetchUser();
    
    // Cleanup activity tracker when component unmounts
    return () => {
      activityTracker.cleanup();
    };
  }, []);

  // Update activity type based on current page
  useEffect(() => {
    if (!user) return;
    
    // Set activity type based on current path
    if (currentPath === '/write') {
      activityTracker.setActivityType('writing');
    } else if (currentPath.startsWith('/blogs/')) {
      activityTracker.setActivityType('reading');
    } else if (currentPath.startsWith('/edit/')) {
      activityTracker.setActivityType('editing');
    } else if (currentPath === '/userinfo') {
      activityTracker.setActivityType('profile');
    } else {
      activityTracker.setActivityType('browsing');
    }
  }, [currentPath, user]);

  const handleLogout = () => {
    // Clean up activity tracker on logout
    activityTracker.cleanup();
    localStorage.removeItem("user");
    setUser(null);
  };

  // Define paths where Nav should be hidden
  const hideNavPaths = ["/signin", "/signup", "/write"];
  
  // Check if navigation should be hidden
  const shouldHideNav = hideNavPaths.includes(currentPath) || 
                        currentPath.startsWith('/blogs/') ||
                        currentPath.startsWith('/edit/');

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) return <div>Loading...</div>;
    
    if (!user) {
      return <Navigate to="/signin" state={{ from: location }} replace />;
    }
    
    return children;
  };

  return (
    <div className="app-container">
      {!shouldHideNav && <Nav user={user} onLogout={handleLogout} />}

      <main className="content-wrapper">
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blogs/:id" element={<BlogDetail user={user} />} />
            <Route 
              path="/userinfo" 
              element={
                <ProtectedRoute>
                  <Userinfo user={user} setUser={setUser} />
                </ProtectedRoute>
              } 
            />
            <Route path="/signin" element={<Signin setUser={setUser} />} />
            <Route path="/signup" element={<Signup setUser={setUser} />} />
            <Route 
              path="/write" 
              element={
                <ProtectedRoute>
                  <WriteArticle user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit/:blogId" 
              element={
                <ProtectedRoute>
                  <EditBlog user={user} />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

export default App;