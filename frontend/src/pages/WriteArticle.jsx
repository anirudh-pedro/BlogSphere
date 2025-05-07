// import { Link, useNavigate } from "react-router-dom";
// import React, { useRef, useState } from 'react';
// import '../styles/write.css';
// import { FaRocket } from "react-icons/fa6";
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
// import { fetchWithAuth } from "../api";

// const WriteArticle = () => {
//   const [title, setTitle] = useState('');
//   const [topic, setTopic] = useState('');
//   const [content, setContent] = useState('');
//   const [image, setImage] = useState(null); // Optional image
//   const [imageDescription, setImageDescription] = useState(''); // Image description
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const navigate = useNavigate();
//   const quillRef = useRef(null);

//   // Image handling
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file && file.type.startsWith('image/')) {
//       setImage(file);
//     } else {
//       setImage(null);
//     }
//   };

//   // Helper to convert file to base64
//   const toBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = (error) => reject(error);
//     });

//   // Form submission handling
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!title.trim() || !topic || !content.trim()) {
//       setError('All fields except image are required.');
//       return;
//     }

//     try {
//       const user = JSON.parse(localStorage.getItem('user'));
//       const token = user?.token;

//       if (!token) {
//         setError('Please login to publish');
//         navigate('/signin');
//         return;
//       }

//       let imageBase64 = null;
//       if (image) {
//         imageBase64 = await toBase64(image);
//       }

//       const blogData = {
//         title,
//         topic,
//         content,
//         image: imageBase64,
//         imageDescription,
//       };
//       console.log("User:", user);
//       console.log("Token:", token);

//       const response = await fetch('http://localhost:5000/api/blogs/create', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(blogData),
//       });

//       if (!response.ok) throw new Error('Failed to publish blog');

//       setSuccess('Blog published successfully!');
//       navigate('/');
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   // Quill Editor Modules
//   const modules = {
//     toolbar: [
//       [{ header: [1, 2, false] }],
//       ['bold', 'italic', 'underline'],
//       [{ list: 'ordered' }, { list: 'bullet' }],
//       ['link'],
//       ['clean']
//     ],
//     clipboard: {
//       matchVisual: false
//     }
//   };

//   return (
//     <div className="write-article">
//       <Link to="/" className="write-article-close">×</Link>
//       <div className="write-article-container">
//         <form onSubmit={handleSubmit}>
//           <div className="write-article-header">
//             <label>Title</label>
//             <input
//               type="text"
//               name="title"
//               onChange={(e) => setTitle(e.target.value)}
//               value={title}
//             />
//           </div>
//           <div className="write-article-header">
//             <label>Topic</label>
//             <select
//               value={topic}
//               onChange={(e) => setTopic(e.target.value)}
//             >
//               <option value="">Select a topic</option>
//               <option value="All">All</option>
//               <option value="Tech">Tech</option>
//               <option value="Sports">Sports</option>
//               <option value="Health">Health</option>
//               <option value="Business">Business</option>
//               <option value="Entertainment">Entertainment</option>
//             </select>
//           </div>
//           <div className="write-article-header">
//             <label>Content</label>
//             <div className="write-article-content">
//               <ReactQuill
//                 ref={quillRef}
//                 value={content}
//                 onChange={setContent}
//                 modules={modules}
//                 theme="snow"
//               />
//             </div>
//           </div>
//           <div className="write-article-header">
//             <label>Image</label>
//             <input
//               type="file"
//               name="image"
//               onChange={handleImageChange}
//             />
//           </div>
//           <div className="write-article-header">
//             <label>Image Description</label>
//             <input
//               type="text"
//               name="imageDescription"
//               onChange={(e) => setImageDescription(e.target.value)}
//               value={imageDescription}
//             />
//           </div>
//           <div className="write-article-header">
//             <button type="submit" className="publish-btn">
//               <FaRocket className="rocket-icon" />
//               Publish Article
//             </button>
//           </div>
//         </form>

//         {error && <p className="error">{error}</p>}
//         {success && <p className="success">{success}</p>}
//       </div>
//     </div>
//   );
// };

// export default WriteArticle;


import { Link, useNavigate } from "react-router-dom";
import React, { useRef, useState } from 'react';
import '../styles/write.css';
import { FaRocket } from "react-icons/fa6";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchWithAuth } from "../api";

const WriteArticle = () => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null); // Optional image
  const [imageDescription, setImageDescription] = useState(''); // Image description
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const navigate = useNavigate();
  const quillRef = useRef(null);

  // Image handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
    } else {
      setImage(null);
    }
  };

  // Helper to convert file to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Form submission handling
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !topic || !content.trim()) {
      setError('All fields except image are required.');
      return;
    }

    setIsPublishing(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;

      if (!token) {
        setError('Please login to publish');
        navigate('/signin');
        return;
      }

      let imageBase64 = null;
      if (image) {
        imageBase64 = await toBase64(image);
      }

      const blogData = {
        title,
        topic,
        content,
        image: imageBase64,
        imageDescription,
      };
      console.log("User:", user);
      console.log("Token:", token);

      const response = await fetch('http://localhost:5000/api/blogs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) throw new Error('Failed to publish blog');

      // Dispatch a custom event that UserStats component will listen for
      const publishEvent = new Event('articlePublished');
      window.dispatchEvent(publishEvent);

      setSuccess('Blog published successfully!');
      
      // Redirect after a short delay to allow animation to be seen
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Quill Editor Modules
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  return (
    <div className="write-article">
      <Link to="/" className="write-article-close">×</Link>
      <div className="write-article-container">
        <form onSubmit={handleSubmit}>
          <div className="write-article-header">
            <label>Title</label>
            <input
              type="text"
              name="title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
          </div>
          <div className="write-article-header">
            <label>Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">Select a topic</option>
              <option value="All">All</option>
              <option value="Tech">Tech</option>
              <option value="Sports">Sports</option>
              <option value="Health">Health</option>
              <option value="Business">Business</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>
          <div className="write-article-header">
            <label>Content</label>
            <div className="write-article-content">
              <ReactQuill
                ref={quillRef}
                value={content}
                onChange={setContent}
                modules={modules}
                theme="snow"
              />
            </div>
          </div>
          <div className="write-article-header">
            <label>Image</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
            />
          </div>
          <div className="write-article-header">
            <label>Image Description</label>
            <input
              type="text"
              name="imageDescription"
              onChange={(e) => setImageDescription(e.target.value)}
              value={imageDescription}
            />
          </div>
          <div className="write-article-header">
            <button 
              type="submit" 
              className={`publish-btn ${isPublishing ? 'publishing' : ''}`}
              disabled={isPublishing}
            >
              <FaRocket className="rocket-icon" />
              {isPublishing ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </form>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
};

export default WriteArticle;