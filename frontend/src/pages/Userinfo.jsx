


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/userinfo.css";

const Userinfo = () => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  // Default profile placeholder that doesn't rely on external services
  const defaultProfileImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Ccircle cx='12' cy='7' r='5'/%3E%3Cpath d='M12 13c-5.5 0-10 4.5-10 10h20c0-5.5-4.5-10-10-10z'/%3E%3C/svg%3E";

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      console.error("User not logged in");
      setLoading(false);
      return;
    }
    setUser(storedUser);
    setPreview(storedUser.profileImage || defaultProfileImage);
    
    // Only attempt to fetch posts if we have a user with token and userId
    if (storedUser.token && storedUser.userId) {
      fetchUserPosts(storedUser);
    } else {
      setLoading(false);
      setApiError("User data incomplete. Please log in again.");
    }
  }, []);

  // Updated fetchUserPosts function for your Userinfo.jsx component

const fetchUserPosts = async (userData) => {
  setLoading(true);
  setApiError(null);
  
  const apiUrl = `http://localhost:5000/api/blogs/user/${userData.userId}`;
  console.log("Fetching posts from:", apiUrl);
  
  try {
    // Check if we have a token before making the request
    if (!userData.token) {
      throw new Error("Authentication token not found. Please login again.");
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${userData.token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies in the request
    });
    
    // First check if response is ok
    if (!response.ok) {
      // Get the error message
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch posts");
    }
    
    // If we get here, response is OK
    const data = await response.json();
    console.log("User posts fetched:", data);
    setPosts(data);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    setApiError(`Error fetching posts: ${error.message}`);
    
    // If token is invalid or expired, clear stored data and redirect to login
    if (error.message.includes("token") || error.message.includes("Auth")) {
      localStorage.removeItem("user");
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    }
  } finally {
    setLoading(false);
  }
};

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    if (!image || !user) return;

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
        const updatedUser = { ...user, profileImage: data.profileImage };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setImage(null);
      } else {
        alert(data.message || "Failed to update profile image");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Network error when updating profile");
    }
  };

  const startEditPost = (post) => {
    setEditingPost(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditTitle("");
    setEditContent("");
  };

  const saveEditedPost = async (postId) => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert("Title and content cannot be empty");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent
        }),
      });

      if (response.ok) {
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, title: editTitle, content: editContent } 
            : post
        ));
        cancelEdit();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Network error when updating post");
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${postId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId));
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Network error when deleting post");
    }
  };

  const viewPost = (postId) => {
    navigate(`/blog/${postId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/signin");
  };

  // Debug current user data for troubleshooting
  const debugUserData = () => {
    console.log("Current user data:", user);
    alert(JSON.stringify(user, null, 2));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {user ? (
        <>
          <div className="profile-header">
            <div className="profile-cover"></div>
            <div className="profile-avatar-container">
              <img 
                src={preview} 
                alt="Profile" 
                className="profile-avatar" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultProfileImage;
                }}
              />
              <div className="profile-avatar-edit">
                <label htmlFor="profile-upload" className="profile-upload-label">
                  Edit
                </label>
                <input 
                  id="profile-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="profile-upload-input" 
                />
              </div>
              {image && (
                <button onClick={handleSaveImage} className="save-avatar-btn">
                  Save
                </button>
              )}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user.username}</h1>
              <p className="profile-email">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Sign Out
            </button>
          </div>

          <div className="profile-content">
            <div className="profile-tabs">
              <button className="tab-btn active">Your Stories</button>
              <button className="tab-btn">Stats</button>
              <button className="tab-btn">Settings</button>
            </div>

            <div className="posts-container">
              <h2 className="posts-title">Your Stories</h2>
              
              {apiError && (
                <div className="api-error">
                  <p>{apiError}</p>
                  <button onClick={() => fetchUserPosts(user)} className="retry-btn">
                    Retry
                  </button>
                </div>
              )}

              {!apiError && posts.length === 0 ? (
                <div className="empty-posts">
                  <p>You haven't published any stories yet.</p>
                  <button 
                    className="start-writing-btn"
                    onClick={() => navigate('/write')}
                  >
                    Start Writing
                  </button>
                </div>
              ) : (
                <div className="posts-list">
                  {posts.map((post) => (
                    <div key={post._id} className="post-item">
                      {editingPost === post._id ? (
                        <div className="edit-form">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="edit-title-input"
                            placeholder="Title"
                          />
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="edit-content-input"
                            placeholder="Content"
                          />
                          <div className="edit-actions">
                            <button onClick={cancelEdit} className="cancel-edit-btn">
                              Cancel
                            </button>
                            <button 
                              onClick={() => saveEditedPost(post._id)} 
                              className="save-edit-btn"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="post-card">
                          <div className="post-content">
                            <h3 className="post-title" onClick={() => viewPost(post._id)}>
                              {post.title}
                            </h3>
                            <p className="post-excerpt">
                              {post.content.length > 150 
                                ? post.content.substring(0, 150) + "..." 
                                : post.content}
                            </p>
                            <div className="post-meta">
                              <span className="post-date">
                                {new Date(post.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              {post.category && (
                                <span className="post-category">{post.category}</span>
                              )}
                            </div>
                          </div>
                          <div className="post-actions">
                            <button 
                              onClick={() => startEditPost(post)} 
                              className="edit-btn"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => deletePost(post._id)} 
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="not-signed-in">
          <p>You need to sign in to view your profile.</p>
          <button onClick={() => navigate('/signin')} className="signin-btn">
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default Userinfo;