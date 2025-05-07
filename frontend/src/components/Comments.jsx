import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import '../styles/comments.css';

const Comments = ({ blogId, user }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blogs/interactions/${blogId}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        } else {
          throw new Error('Failed to fetch comments');
        }
      } catch (err) {
        setError('Failed to load comments. Please try again.');
      }
    };

    fetchComments();
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/blogs/interactions/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: comment })
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prevComments => [newComment, ...prevComments]);
        setComment('');
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (err) {
      setError('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comments-section">
      <h3>Comments</h3>
      
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !comment.trim()}>
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      ) : (
        <p className="login-prompt">Please log in to leave a comment.</p>
      )}

      <div className="comments-list">
        {comments.map((comment, index) => (
          <div key={comment._id || index} className="comment">
            <div className="comment-header">
              <span className="comment-author">{comment.user?.username || 'Anonymous'}</span>
              <span className="comment-date">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="comment-text">{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;