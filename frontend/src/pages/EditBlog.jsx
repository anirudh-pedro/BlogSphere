import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditBlog = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState({ title: "", content: "" });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`http://localhost:5000/blogs/${blogId}`);
        const data = await response.json();
        if (response.ok) {
          setBlog({ title: data.title, content: data.content });
        } else {
          console.error("Failed to fetch blog:", data.message);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    fetchBlog();
  }, [blogId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blog),
      });

      if (response.ok) {
        navigate("/Userinfo"); // Redirect to user blog list
      } else {
        console.error("Failed to update blog");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };

  return (
    <div>
      <h2>Edit Blog</h2>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          value={blog.title}
          onChange={(e) => setBlog({ ...blog, title: e.target.value })}
          required
        />
        <textarea
          value={blog.content}
          onChange={(e) => setBlog({ ...blog, content: e.target.value })}
          required
        />
        <button type="submit">Update Blog</button>
      </form>
    </div>
  );
};

export default EditBlog;
