




// import { useNavigate, Link } from "react-router-dom";
// import React, { useEffect, useState } from "react";
// import "../styles/home.css";
// import { API_BASE_URL } from "../config/api";

// const Home = () => {
//   const [blogs, setBlogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedTopic, setSelectedTopic] = useState("All");
//   const [techNews, setTechNews] = useState([]);
//   const [newsLoading, setNewsLoading] = useState(true);
//   const navigate = useNavigate();
//   const topics = ["All", "Tech", "Sports", "Health", "Business", "Entertainment"];

//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         let token = localStorage.getItem("accessToken");

//         if (!token) {
//           await refreshAccessToken();
//           token = localStorage.getItem("accessToken");
//         }

//         if (!token) {
//           navigate("/signin");
//           return;
//         }

//         const response = await fetch(`${API_BASE_URL}/api/blogs`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           credentials: 'include',
//         });

//         const data = await response.json();

//         if (response.ok && Array.isArray(data)) {
//           setBlogs(data);
//         } else {
//           setBlogs([]);
//           setError("Failed to fetch blogs.");
//         }
//       } catch (err) {
//         setError("Failed to fetch blogs.");
//         setBlogs([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const refreshAccessToken = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/users/refresh-token`, {
//           method: 'POST',
//           credentials: 'include',
//         });

//         if (res.ok) {
//           const data = await res.json();
//           localStorage.setItem("accessToken", data.token);
//         } else {
//           navigate("/signin");
//         }
//       } catch (error) {
//         console.error("Error refreshing token", error);
//         navigate("/signin");
//       }
//     };

//     fetchBlogs();
//   }, [selectedTopic, navigate]);

//   // Fetch tech news for the side section
//   useEffect(() => {
//     const fetchTechNews = async () => {
//       try {
//         setNewsLoading(true);
        
//         // You would replace this with your actual news API endpoint
//         // For now, we'll use a mock response
        
//         // Simulate API call delay
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         // Mock tech news data
//         const mockNewsData = [
//           {
//             id: 1,
//             title: "Apple Announces New MacBook Pro with M3 Chip",
//             summary: "Apple has unveiled its latest MacBook Pro featuring the new M3 chip, promising significant performance improvements and battery life extensions.",
//             source: "Tech Chronicle",
//             date: "2025-04-24",
//             url: "#"
//           },
//           {
//             id: 2,
//             title: "Microsoft Releases Major Windows Update",
//             summary: "The new Windows update brings AI-powered features to millions of users, focusing on productivity and accessibility improvements.",
//             source: "Digital Today",
//             date: "2025-04-23",
//             url: "#"
//           },
//           {
//             id: 3,
//             title: "Breakthrough in Quantum Computing Announced",
//             summary: "Researchers have achieved a new milestone in quantum computing, demonstrating a stable 1000-qubit processor for the first time.",
//             source: "Science Daily",
//             date: "2025-04-22",
//             url: "#"
//           },
//           {
//             id: 4,
//             title: "SpaceX Successfully Launches 50 Satellites in Single Mission",
//             summary: "The latest Starlink mission sets a new record for the number of satellites deployed in a single launch.",
//             source: "Space News",
//             date: "2025-04-21",
//             url: "#"
//           },
//           {
//             id: 5,
//             title: "New AI Tool Translates Speech in Real-time with 99% Accuracy",
//             summary: "The breakthrough technology can translate between 95 languages instantly with near-perfect accuracy, even in noisy environments.",
//             source: "AI Insider",
//             date: "2025-04-20",
//             url: "#"
//           }
//         ];
        
//         setTechNews(mockNewsData);
//       } catch (err) {
//         console.error("Failed to fetch tech news", err);
//       } finally {
//         setNewsLoading(false);
//       }
//     };

//     fetchTechNews();
//   }, []);

//   const filteredBlogs = selectedTopic === "All"
//     ? blogs
//     : blogs.filter(blog => blog.topic === selectedTopic);

//   // State for handling "Read More" functionality
//   const [expandedBlogId, setExpandedBlogId] = useState(null);

//   const handleReadMore = (blogId) => {
//     if (expandedBlogId === blogId) {
//       setExpandedBlogId(null); // Collapse the blog if already expanded
//     } else {
//       setExpandedBlogId(blogId); // Expand the selected blog
//     }
//   };

//   // Format date function
//   const formatDate = (dateString) => {
//     if (!dateString) return "Unknown date";
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric' 
//     });
//   };

//   return (
//     <div className="home-container">
//       <div className="topic-filter">
//         {topics.map((topic) => (
//           <button
//             key={topic}
//             onClick={() => setSelectedTopic(topic)}
//             className={`topic-btn ${selectedTopic === topic ? 'active' : ''}`}
//           >
//             {topic}
//           </button>
//         ))}
//       </div>

//       <div className="content-split">
//         <div className="blogs-section">
//           {loading ? (
//             <div className="loading">Loading</div>
//           ) : error ? (
//             <div className="error">{error}</div>
//           ) : (
//             <div className="blogs-grid">
//               {filteredBlogs.length === 0 ? (
//                 <div>No blogs available</div>
//               ) : (
//                 filteredBlogs.map((blog) => (
//                   <div key={blog._id} className="blog-div">
//                     <div className="blog-content-wrapper">
//                       <h2>{blog.title}</h2>
                      
//                       <div className="blog-metadata">
//                         <span><strong>Topic:</strong> {blog.topic || "No topic"}</span>
//                         <span><strong>By:</strong> {blog.author?.username || "Unknown Author"}</span>
//                       </div>
                      
//                       <div className="blog-content">
//                         <p
//                           dangerouslySetInnerHTML={{
//                             __html: expandedBlogId === blog._id 
//                               ? blog.content 
//                               : `${blog.content.substring(0, 200)}${blog.content.length > 200 ? '...' : ''}`
//                           }}
//                         />
//                       </div>
                      
//                       <div className="blog-buttons">
//                         <button
//                           onClick={() => handleReadMore(blog._id)}
//                           className="read-more-btn"
//                         >
//                           {expandedBlogId === blog._id ? "Read Less" : "Read More"}
//                         </button>

//                         <Link to={`/blogs/${blog._id}`} className="view-detail-btn">
//                           View Full Blog
//                         </Link>
//                       </div>
//                     </div>
                    
//                     <div className="blog-image-wrapper">
//                       <img 
//                         src={blog.image ? blog.image : "/default-image.jpg"}  
//                         alt={blog.title}
//                         className="blog-image"
//                       />
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>

//         <div className="side-section">
//           <h3>Live Tech News</h3>
          
//           {newsLoading ? (
//             <div className="news-loading">Loading tech news</div>
//           ) : (
//             techNews.map(news => (
//               <div key={news.id} className="news-item">
//                 <h4>{news.title}</h4>
//                 <p>{news.summary}</p>
//                 <div className="news-source">
//                   <span>{news.source} • {formatDate(news.date)}</span>
//                   <a href={news.url} className="news-read-more" target="_blank" rel="noopener noreferrer">
//                     Read More
//                   </a>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;




import { useNavigate, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../styles/home.css";
import { API_BASE_URL } from "../config/api";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [techNews, setTechNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const navigate = useNavigate();
  const topics = ["All", "Tech", "Sports", "Health", "Business", "Entertainment"];
  
  // News API key
  const NEWS_API_KEY = "5bd82efb819e4371bf3374dcbbf50343";

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        let token = localStorage.getItem("accessToken");

        if (!token) {
          await refreshAccessToken();
          token = localStorage.getItem("accessToken");
        }

        if (!token) {
          navigate("/signin");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/blogs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          setBlogs(data);
        } else {
          setBlogs([]);
          setError("Failed to fetch blogs.");
        }
      } catch (err) {
        setError("Failed to fetch blogs.");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    const refreshAccessToken = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/refresh-token`, {
          method: 'POST',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("accessToken", data.token);
        } else {
          navigate("/signin");
        }
      } catch (error) {
        console.error("Error refreshing token", error);
        navigate("/signin");
      }
    };

    fetchBlogs();
  }, [selectedTopic, navigate]);

  // Fetch tech news from News API
  useEffect(() => {
    const fetchTechNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError(null);
        
        // Fetching top headlines in technology category
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`
        );
        
        const data = await response.json();
        
        if (response.ok && data.status === "ok") {
          setTechNews(data.articles);
        } else {
          setNewsError("Failed to fetch news data");
          // Fallback to sample data if API fails
          setTechNews([
            {
              title: "Apple Announces New MacBook Pro with M3 Chip",
              description: "Apple has unveiled its latest MacBook Pro featuring the new M3 chip, promising significant performance improvements.",
              source: { name: "Tech Chronicle" },
              publishedAt: "2025-04-24T12:00:00Z",
              url: "#"
            },
            {
              title: "Microsoft Releases Major Windows Update",
              description: "The new Windows update brings AI-powered features to millions of users, focusing on productivity improvements.",
              source: { name: "Digital Today" },
              publishedAt: "2025-04-23T10:30:00Z",
              url: "#"
            },
            {
              title: "Breakthrough in Quantum Computing Announced",
              description: "Researchers have achieved a new milestone in quantum computing, demonstrating a stable 1000-qubit processor.",
              source: { name: "Science Daily" },
              publishedAt: "2025-04-22T15:45:00Z",
              url: "#"
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch tech news", err);
        setNewsError("Error connecting to news service");
        // Use sample data as fallback
        setTechNews([
          {
            title: "SpaceX Successfully Launches 50 Satellites",
            description: "The latest Starlink mission sets a new record for the number of satellites deployed in a single launch.",
            source: { name: "Space News" },
            publishedAt: "2025-04-21T09:15:00Z",
            url: "#"
          },
          {
            title: "New AI Tool Translates Speech in Real-time",
            description: "The breakthrough technology can translate between 95 languages instantly with near-perfect accuracy.",
            source: { name: "AI Insider" },
            publishedAt: "2025-04-20T16:20:00Z",
            url: "#"
          }
        ]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchTechNews();
    
    // Set up a refresh interval (every 30 minutes)
    const newsRefreshInterval = setInterval(() => {
      fetchTechNews();
    }, 30 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(newsRefreshInterval);
  }, [NEWS_API_KEY]);

  const filteredBlogs = selectedTopic === "All"
    ? blogs
    : blogs.filter(blog => blog.topic === selectedTopic);

  // State for handling "Read More" functionality
  const [expandedBlogId, setExpandedBlogId] = useState(null);

  const handleReadMore = (blogId) => {
    if (expandedBlogId === blogId) {
      setExpandedBlogId(null); // Collapse the blog if already expanded
    } else {
      setExpandedBlogId(blogId); // Expand the selected blog
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to truncate text with ellipsis
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="home-container">
      <div className="topic-filter">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`topic-btn ${selectedTopic === topic ? 'active' : ''}`}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="content-split">
        <div className="blogs-section">
          {loading ? (
            <div className="loading">Loading</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="blogs-grid">
              {filteredBlogs.length === 0 ? (
                <div>No blogs available</div>
              ) : (
                filteredBlogs.map((blog) => (
                  <div key={blog._id} className="blog-div">
                    <div className="blog-content-wrapper">
                      <h2>{blog.title}</h2>
                      
                      <div className="blog-metadata">
                        <span><strong>Topic:</strong> {blog.topic || "No topic"}</span>
                        <span><strong>By:</strong> {blog.author?.username || "Unknown Author"}</span>
                      </div>
                      
                      <div className="blog-content">
                        <p
                          dangerouslySetInnerHTML={{
                            __html: expandedBlogId === blog._id 
                              ? blog.content 
                              : `${blog.content.substring(0, 200)}${blog.content.length > 200 ? '...' : ''}`
                          }}
                        />
                      </div>
                      
                      <div className="blog-buttons">
                        <button
                          onClick={() => handleReadMore(blog._id)}
                          className="read-more-btn"
                        >
                          {expandedBlogId === blog._id ? "Read Less" : "Read More"}
                        </button>

                        <Link to={`/blogs/${blog._id}`} className="view-detail-btn">
                          View Full Blog
                        </Link>
                      </div>
                    </div>
                    
                    <div className="blog-image-wrapper">
                      <img 
                        src={blog.image ? blog.image : "/default-image.jpg"}  
                        alt={blog.title}
                        className="blog-image"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="side-section">
          <h3>Live Tech News</h3>
          
          {newsLoading ? (
            <div className="news-loading">Loading tech news</div>
          ) : newsError ? (
            <div className="news-error">{newsError}</div>
          ) : (
            <>
              
              
              {techNews.map((news, index) => (
                <div key={index} className="news-item">
                  <h4>{news.title}</h4>
                  <p>{truncateText(news.description, 120)}</p>
                  <div className="news-source">
                    <span>{news.source?.name || "Unknown Source"} • {formatDate(news.publishedAt)}</span>
                    <a href={news.url} className="news-read-more" target="_blank" rel="noopener noreferrer">
                      Read More
                    </a>
                  </div>
                </div>
              ))}
              
              
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
