// import { useNavigate, Link } from "react-router-dom";
// import React, { useEffect, useState } from "react";
// import "../styles/home.css";
// import { API_BASE_URL } from "../config/api";
// import Chat from "../components/Chat";
// const Home = () => {
//   const [blogs, setBlogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedTopic, setSelectedTopic] = useState("All");
//   const [techNews, setTechNews] = useState([]);
//   const [newsLoading, setNewsLoading] = useState(true);
//   const [newsError, setNewsError] = useState(null);
//   const navigate = useNavigate();
//   const topics = ["All", "Tech", "Sports", "Health", "Business", "Entertainment"];
  
//   // News API key
//   const NEWS_API_KEY = "77c3b0876c394d409c29298539669472";

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

//   // Fetch tech news from News API
//   useEffect(() => {
//     const fetchTechNews = async () => {
//       try {
//         setNewsLoading(true);
//         setNewsError(null);
        
//         // Fetching top headlines in technology category
//         const response = await fetch(
//           `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`
//         );
        
//         const data = await response.json();
        
//         if (response.ok && data.status === "ok") {
//           setTechNews(data.articles);
//         } else {
//           setNewsError("Failed to fetch news data");
//           // Fallback to sample data if API fails
//           setTechNews([
//             {
//               title: "Apple Announces New MacBook Pro with M3 Chip",
//               description: "Apple has unveiled its latest MacBook Pro featuring the new M3 chip, promising significant performance improvements.",
//               source: { name: "Tech Chronicle" }, 
//               publishedAt: "2025-04-24T12:00:00Z",
//               url: "#"
//             },
//             {
//               title: "Microsoft Releases Major Windows Update",
//               description: "The new Windows update brings AI-powered features to millions of users, focusing on productivity improvements.",
//               source: { name: "Digital Today" },
//               publishedAt: "2025-04-23T10:30:00Z",
//               url: "#"
//             },
//             {
//               title: "Breakthrough in Quantum Computing Announced",
//               description: "Researchers have achieved a new milestone in quantum computing, demonstrating a stable 1000-qubit processor.",
//               source: { name: "Science Daily" },
//               publishedAt: "2025-04-22T15:45:00Z",
//               url: "#"
//             }
//           ]);
//         }
//       } catch (err) {
//         console.error("Failed to fetch tech news", err);
//         setNewsError("Error connecting to news service");
//         // Use sample data as fallback
//         setTechNews([
//           {
//             title: "SpaceX Successfully Launches 50 Satellites",
//             description: "The latest Starlink mission sets a new record for the number of satellites deployed in a single launch.",
//             source: { name: "Space News" },
//             publishedAt: "2025-04-21T09:15:00Z",
//             url: "#"
//           },
//           {
//             title: "New AI Tool Translates Speech in Real-time",
//             description: "The breakthrough technology can translate between 95 languages instantly with near-perfect accuracy.",
//             source: { name: "AI Insider" },
//             publishedAt: "2025-04-20T16:20:00Z",
//             url: "#"
//           }
//         ]);
//       } finally {
//         setNewsLoading(false);
//       }
//     };

//     fetchTechNews();
    
//     // Set up a refresh interval (every 30 minutes)
//     const newsRefreshInterval = setInterval(() => {
//       fetchTechNews();
//     }, 30 * 60 * 1000);
    
//     // Clean up interval on component unmount
//     return () => clearInterval(newsRefreshInterval);
//   }, [NEWS_API_KEY]);

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

//   // Function to truncate text with ellipsis
//   const truncateText = (text, maxLength) => {
//     if (!text) return "";
//     return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
//           ) : newsError ? (
//             <div className="news-error">{newsError}</div>
//           ) : (
//             <>
              
              
//               {techNews.map((news, index) => (
//                 <div key={index} className="news-item">
//                   <h4>{news.title}</h4>
//                   <p>{truncateText(news.description, 120)}</p>
//                   <div className="news-source">
//                     <span>{news.source?.name || "Unknown Source"} • {formatDate(news.publishedAt)}</span>
//                     <a href={news.url} className="news-read-more" target="_blank" rel="noopener noreferrer">
//                       Read More
//                     </a>
//                   </div>
//                 </div>
//               ))}
              
//             </>
//           )}
//           <Chat />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;


import { useNavigate, Link } from "react-router-dom";
import React, { useEffect, useState, useRef, useCallback } from "react";
import "../styles/home.css";
import { API_BASE_URL } from "../config/api";
import Chat from "../components/Chat";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [visibleBlogs, setVisibleBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [techNews, setTechNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const blogsPerPage = 5; // Number of blogs to load per page
  const observer = useRef();
  const navigate = useNavigate();
  const topics = ["All", "Tech", "Sports", "Health", "Business", "Entertainment"];
  
  // News API key
  const NEWS_API_KEY = "77c3b0876c394d409c29298539669472";

  // Function to load more blogs when scrolling
  const loadMoreBlogs = useCallback(() => {
    if (loading || !hasMore) return;
    
    const filtered = selectedTopic === "All" 
      ? blogs 
      : blogs.filter(blog => blog.topic === selectedTopic);
    
    const nextPage = page + 1;
    const endIndex = nextPage * blogsPerPage;
    
    // This is the key fix - we need to show ALL blogs up to the current page,
    // not just slice from the beginning each time
    const newVisibleBlogs = filtered.slice(0, endIndex);
    
    setVisibleBlogs(newVisibleBlogs);
    setPage(nextPage);
    setHasMore(endIndex < filtered.length);
  }, [blogs, selectedTopic, page, loading, hasMore, blogsPerPage]);

  // Set up intersection observer for infinite scroll
  const lastBlogElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log("Intersection observed, loading more blogs");
        setLoadingMore(true);
        setTimeout(() => {
          loadMoreBlogs();
          setLoadingMore(false);
        }, 500);
      }
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMoreBlogs]);

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
          
          // Reset pagination when fetching new blogs
          setPage(1);
          const initialBlogs = selectedTopic === "All" 
            ? data.slice(0, blogsPerPage) 
            : data.filter(blog => blog.topic === selectedTopic).slice(0, blogsPerPage);
          
          setVisibleBlogs(initialBlogs);
          setHasMore(initialBlogs.length < (selectedTopic === "All" ? data.length : data.filter(blog => blog.topic === selectedTopic).length));
        } else {
          setBlogs([]);
          setVisibleBlogs([]);
          setError("Failed to fetch blogs.");
        }
      } catch (err) {
        setError("Failed to fetch blogs.");
        setBlogs([]);
        setVisibleBlogs([]);
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

  // Reset pagination when topic changes
  useEffect(() => {
    setPage(1);
    const filtered = selectedTopic === "All" 
      ? blogs 
      : blogs.filter(blog => blog.topic === selectedTopic);
    
    setVisibleBlogs(filtered.slice(0, blogsPerPage));
    setHasMore(blogsPerPage < filtered.length);
  }, [selectedTopic, blogs]);

  // Your existing tech news fetch code...
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

  // Your existing formatDate and truncateText functions...
  
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
              {visibleBlogs.length === 0 ? (
                <div>No blogs available</div>
              ) : (
                visibleBlogs.map((blog, index) => (
                  <div 
                    key={blog._id} 
                    className="blog-div"
                    ref={index === visibleBlogs.length - 1 ? lastBlogElementRef : null}
                  >
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
              
              {loadingMore && (
                <div className="loading-more" style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  width: '100%',
                  gridColumn: '1 / -1',  
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  marginTop: '20px'
                }}>
                  <div className="spinner"></div>
                  Loading more blogs...
                </div>
              )}
              
              {!hasMore && visibleBlogs.length > 0 && (
                <div className="no-more-blogs">No more blogs to load</div>
              )}
            </div>
          )}
        </div>

        <div className="side-section">
          <h3>Live Tech News</h3>
          <div className="news-container">
            {newsLoading ? (
              <div className="news-loading">Loading tech news</div>
            ) : newsError ? (
              <div className="news-error">{newsError}</div>
            ) : (
              techNews.map((news, index) => (
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
              ))
            )}
          </div>
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Home;
