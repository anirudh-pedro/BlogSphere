import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import WriteArticle from "./pages/WriteArticle";
import EditBlog from "./pages/EditBlog";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import BlogDetail from "./pages/BlogDetails";
import Userinfo from "./pages/Userinfo";

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase(); // normalize path

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  // Define paths where Nav should be hidden
  const hideNavPaths = new Set(["/signin", "/signup", "/write"]);
  
  // Add blog detail path
  const hideNav = hideNavPaths.has(currentPath) || currentPath.startsWith('/blogs/');

  return (
    <>
      {!hideNav && <Nav user={user} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/Userinfo" element={<Userinfo />} />
        <Route path="/signin" element={<Signin setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/write" element={<WriteArticle />} />
        <Route path="/edit/:blogId" element={<EditBlog />} />
      </Routes>
    </>
  );
}

export default App;
