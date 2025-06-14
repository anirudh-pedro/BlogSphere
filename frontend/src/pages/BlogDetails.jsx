// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import '../styles/blogDetails.css';
// import { API_BASE_URL } from "../config/api";

// const BlogDetail = () => {
//   const { id } = useParams(); // Get blog ID from the URL
//   const navigate = useNavigate(); // Initialize navigate hook
//   const [blog, setBlog] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchBlog = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`);
//         const data = await response.json();

//         if (response.ok) {
//           setBlog(data);
//         } else {
//           setError("Failed to fetch blog.");
//         }
//       } catch (err) {
//         setError("Failed to fetch blog.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBlog();
//   }, [id]);

//   const goBack = () => {
//     navigate(-1); // Navigate back to the previous page
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className="blog-detail-container">
//       {/* Back Button with X */}
//       <button className="back-button" onClick={goBack}>X</button>

//       {/* Topic and Author */}
//       <div className="blog-header">
//         <p className="blog-topic"><strong>Topic:</strong> {blog.topic || "No topic"}</p>
//         <p className="blog-author"><strong>Author:</strong> {blog.author.username || "Unknown Author"}</p>
//       </div>

//       {/* Image and Image Description */}
//       <div className="blog-detail-image-container">
//         <div className="image-description">
//           {blog.imageDescription || "No description available for this image."}
//         </div>
//         <img
//           src={blog.image || "/default-image.jpg"}
//           alt={blog.title}
//           className="blog-detail-image"
//         />
//       </div>

//       {/* Blog Content */}
//       <div className="blog-content">
//         <p dangerouslySetInnerHTML={{ __html: blog.content }} />
//       </div>
//     </div>
//   );
// };

// export default BlogDetail;



import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../styles/blogDetails.css';
import { API_BASE_URL } from "../config/api";
import Comments from '../components/Comments';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const BlogDetail = () => {
  const { id } = useParams(); // Get blog ID from the URL
  const navigate = useNavigate(); // Initialize navigate hook
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

    const handleLike = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/blogs/interactions/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        setLiked(data.liked);
        setLikeCount(data.likes);
      } else {
        console.error('Failed to update like:', data.message);
        if (response.status === 401) {
          navigate('/signin');
        }
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`);
        const data = await response.json();

        if (response.ok) {
          setBlog(data);
        } else {
          setError("Failed to fetch blog.");
        }
      } catch (err) {
        setError("Failed to fetch blog.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const goBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!blog) return <div className="error-container">Blog not found</div>;

  return (
    <div className="blog-detail-container">
      {/* Back Button with X */}
      <button className="back-button" onClick={goBack}>X</button>

      {/* Topic and Author */}
      <div className="blog-header">
        <p className="blog-topic"><strong>Topic:</strong> {blog.topic || "No topic"}</p>
        <p className="blog-author">
          <strong>Author:</strong> {blog.author?.username || "Unknown Author"}
        </p>
      </div>

      {/* Title */}
      <h1 className="blog-title">{blog.title}</h1>

      {/* Image and Image Description */}
      <div className="blog-detail-image-container">
        <div className="image-description">
          {blog.imageDescription || "No description available for this image."}
        </div>
        <img
          src={blog.image || "/default-image.jpg"}
          alt={blog.title}
          className="blog-detail-image"
        />
      </div>

      {/* Blog Content */}
      <div className="blog-content">
        <p dangerouslySetInnerHTML={{ __html: blog.content }} />
      </div>

      {/* Like Button */}
      <div className="blog-actions">
        <button 
          className={`like-button ${liked ? 'liked' : ''}`} 
          onClick={handleLike}
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
          <span>{likeCount} likes</span>
        </button>
      </div>

      {/* Comments Section */}
      <Comments blogId={id} user={blog.author} />
    </div>
  );
};

export default BlogDetail;