




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
  const [uploading, setUploading] = useState(false); // State for image processing
  const [updating, setUpdating] = useState(false); // State for image upload to server
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  const defaultProfileImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Ccircle cx='12' cy='7' r='5'/%3E%3Cpath d='M12 13c-5.5 0-10 4.5-10 10h20c0-5.5-4.5-10-10-10z'/%3E%3C/svg%3E";

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.token || !storedUser.userId) {
      localStorage.clear();
      navigate("/signin");
      return;
    }

    setUser(storedUser);
    
    // Use the stored profile image if available, otherwise use default
    if (storedUser.profileImage) {
      setPreview(storedUser.profileImage);
    } else {
      setPreview(defaultProfileImage);
    }
    
    fetchUserPosts(storedUser);
  }, [navigate]);

  const fetchUserPosts = async (userData) => {
    setLoading(true);
    setApiError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/blogs/user/${userData.userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userData.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Fetch error:", error.message);
      setApiError(error.message);

      if (error.message.toLowerCase().includes("token")) {
        localStorage.clear();
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to compress and resize the image before upload
  const processImage = (file, maxWidth = 500, maxHeight = 500, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Maintain aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Updated image upload handler with compression
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, or WEBP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      // Process and compress the image
      const processedImage = await processImage(file);
      setPreview(processedImage);
      setImage(processedImage);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process the image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveImage = async () => {
    if (!image || !user) return;
    
    setUpdating(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user.userId, profileImage: image }),
        credentials: "include",
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update local storage with new profile image
        const updatedUser = { ...user, profileImage: data.profileImage };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setImage(null); // Clear the temporary image state
        
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = 'Profile image updated successfully!';
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
          notification.classList.add('fade-out');
          setTimeout(() => notification.remove(), 500);
        }, 3000);
      } else {
        throw new Error(data.message || "Failed to update profile image");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      
      // Create error notification
      const notification = document.createElement('div');
      notification.className = 'notification error';
      notification.textContent = error.message || "Error updating profile image";
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
      }, 3000);
    } finally {
      setUpdating(false);
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
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (response.ok) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, title: editTitle, content: editContent }
              : post
          )
        );
        cancelEdit();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update post");
      }
    } catch (error) {
      alert("Network error while updating post");
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        setPosts((prev) => prev.filter((post) => post._id !== postId));
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete post");
      }
    } catch (error) {
      alert("Network error while deleting post");
    }
  };

  const viewPost = (postId) => {
    navigate(`/blog/${postId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/signin");
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
                src={preview || defaultProfileImage}
                alt="Profile"
                className="profile-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultProfileImage;
                }}
              />
              <div className="profile-avatar-edit">
                <label htmlFor="profile-upload" className="profile-upload-label">
                  {uploading || updating ? "" : "Edit"}
                  {uploading && <span className="uploading-indicator"></span>}
                  {updating && <span className="uploading-indicator"></span>}
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  onChange={handleImageUpload}
                  className="profile-upload-input"
                  disabled={uploading || updating}
                />
              </div>
              {image && (
                <button 
                  onClick={handleSaveImage} 
                  className="save-avatar-btn"
                  disabled={uploading || updating}
                >
                  {updating ? "Saving..." : "Save"}
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
                  <button className="start-writing-btn" onClick={() => navigate("/write")}>
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
                            <button onClick={() => saveEditedPost(post._id)} className="save-edit-btn">
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
                                {new Date(post.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              {post.category && <span className="post-category">{post.category}</span>}
                            </div>
                          </div>
                          <div className="post-actions">
                            <button onClick={() => startEditPost(post)} className="edit-btn">
                              Edit
                            </button>
                            <button onClick={() => deletePost(post._id)} className="delete-btn">
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
          <button onClick={() => navigate("/signin")} className="signin-btn">
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default Userinfo;