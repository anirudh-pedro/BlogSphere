import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import at the top
import "../styles/userinfo.css";

const Userinfo = () => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [posts, setPosts] = useState([]); // ✅ Store user's posts
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      console.error("User not logged in");
      return;
    }
    setUser(storedUser);
    setPreview(storedUser.profileImage || "https://via.placeholder.com/150"); // Default image
    fetchUserPosts(storedUser.userId); // ✅ Fetch user posts
  }, []);

  const fetchUserPosts = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/user/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setPosts(data);
      } else {
        console.error("Error fetching posts:", data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result); // Show preview before upload
      setImage(reader.result);   // Store image data
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    if (!image || !user) return;

    const token = user?.token;
    if (!token) {
      alert("User not authenticated!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/update-profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ userId: user.userId, profileImage: image }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Profile image updated!");
        const updatedUser = { ...user, profileImage: data.profileImage };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/signin"); // ✅ Redirect to login page
  };

  return (
    <div className="userinfo-container">
      <h1 className="userinfo-title">User Info</h1>
      {user ? (
        <div className="userinfo-content">
          <div className="profile-section">
            <img src={preview} alt="Profile" className="profile-image" />
            <h2 className="username">{user.username}</h2>
          </div>
          <div className="upload-section">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
            <button onClick={handleSaveImage} className="save-btn">Save Image</button>
          </div>

          <h2 className="posts-title">Your Blog Posts</h2>
          {posts.length === 0 ? (
            <p>No posts found</p>
          ) : (
            <ul className="posts-list">
              {posts.map((post) => (
                <li key={post._id}>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                </li>
              ))}
            </ul>
          )}

          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      ) : (
        <p className="userinfo-message">User not logged in. Please sign in.</p>
      )}
    </div>
  );
};

export default Userinfo;
