import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [blogs, setBlogs] = useState([]);
    const navigate = useNavigate();
    const userEmail = localStorage.getItem('userEmail'); // Get logged-in user's email

    useEffect(() => {
        if (!userEmail) {
            navigate('/signin');
            return;
        }
        fetch(`http://localhost:5000/user-blogs?email=${userEmail}`)
            .then(response => response.json())
            .then(data => setBlogs(data.blogs))
            .catch(error => console.error('Error fetching blogs:', error));
    }, [userEmail, navigate]);

    return (
        <div className="dashboard-container">
            <h2>Your Blog Posts</h2>
            {blogs.length === 0 ? (
                <p>No blogs published yet.</p>
            ) : (
                <ul>
                    {blogs.map(blog => (
                        <li key={blog._id}>
                            <h3>{blog.title}</h3>
                            <p>{blog.description}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dashboard;
