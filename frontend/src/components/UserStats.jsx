


// // import React, { useState, useEffect } from 'react';
// // // Import the CSS if it exists
// // import '../styles/userstats.css';

// // const UserStats = ({ user }) => {
// //   const [loading, setLoading] = useState(true);
// //   const [weeklyActivity, setWeeklyActivity] = useState([]);
// //   const [yearlyPosts, setYearlyPosts] = useState([]);
// //   const [activeTab, setActiveTab] = useState('weekly');
// //   const [statsError, setStatsError] = useState(null);

// //   // Days of week and months for labels
// //   const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// //   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// //   useEffect(() => {
// //     // If no user is provided from parent, check localStorage
// //     const fetchUserData = () => {
// //       const storedUser = user || JSON.parse(localStorage.getItem("user"));
// //       if (!storedUser || !storedUser.token) {
// //         setStatsError("User authentication required");
// //         setLoading(false);
// //         return null;
// //       }
// //       return storedUser;
// //     };

// //     const userData = fetchUserData();
// //     if (!userData) return;
    
// //     // Fetch the user's activity data
// //     const fetchUserStats = async () => {
// //       setLoading(true);
// //       setStatsError(null);
      
// //       try {
// //         // For weekly activity data
// //         const weeklyResponse = await fetch(`http://localhost:5000/api/stats/weekly-activity`, {
// //           headers: {
// //             Authorization: `Bearer ${userData.token}`
// //           }
// //         });
        
// //         // For yearly posts data
// //         const yearlyResponse = await fetch(`http://localhost:5000/api/stats/yearly-posts`, {
// //           headers: {
// //             Authorization: `Bearer ${userData.token}`
// //           }
// //         });
        
// //         if (!weeklyResponse.ok || !yearlyResponse.ok) {
// //           throw new Error("Failed to fetch user statistics");
// //         }
        
// //         const weeklyData = await weeklyResponse.json();
// //         const yearlyData = await yearlyResponse.json();
        
// //         setWeeklyActivity(weeklyData);
// //         setYearlyPosts(yearlyData);
// //         setLoading(false);
// //       } catch (error) {
// //         console.error("Error fetching statistics:", error);
// //         setStatsError(error.message);
        
// //         // For development/demo: Generate mock data if API fails
// //         generateMockData();
// //       }
// //     };

// //     fetchUserStats();
// //   }, [user]);

// //   // Mock data generator for development/demonstration
// //   const generateMockData = () => {
// //     console.log("Generating mock data");
    
// //     // Mock weekly activity data (hours per day of week)
// //     const mockWeeklyData = daysOfWeek.map(day => ({
// //       day,
// //       hours: Math.floor(Math.random() * 5) + 1
// //     }));
    
// //     // Mock yearly posts data (last 52 weeks)
// //     const today = new Date();
// //     const mockYearlyData = [];
    
// //     for (let i = 365; i >= 0; i--) {
// //       const date = new Date();
// //       date.setDate(today.getDate() - i);
      
// //       // Generate random post count (0-4)
// //       const count = Math.floor(Math.random() * 5);
      
// //       mockYearlyData.push({
// //         date: date.toISOString().split('T')[0],
// //         count
// //       });
// //     }
    
// //     setWeeklyActivity(mockWeeklyData);
// //     setYearlyPosts(mockYearlyData);
// //     setLoading(false);
// //   };

// //   // Function to determine cell color based on post count
// //   const getCellColor = (count) => {
// //     if (count === 0) return 'empty';
// //     if (count === 1) return 'light';
// //     if (count === 2) return 'medium';
// //     return 'dark';
// //   };

// //   // Group yearly posts by week for the heatmap
// //   const groupPostsByWeek = () => {
// //     const weeks = [];
// //     let currentWeek = [];
    
// //     // Get the day of week for the first date (to align the grid)
// //     if (yearlyPosts.length > 0) {
// //       const firstDate = new Date(yearlyPosts[0].date);
// //       const firstDay = firstDate.getDay();
      
// //       // Add empty cells for proper alignment
// //       for (let i = 0; i < firstDay; i++) {
// //         currentWeek.push(null);
// //       }
      
// //       // Process all days
// //       yearlyPosts.forEach((day, index) => {
// //         const date = new Date(day.date);
// //         const dayOfWeek = date.getDay();
        
// //         currentWeek.push(day);
        
// //         // Start a new week after Saturday
// //         if (dayOfWeek === 6 || index === yearlyPosts.length - 1) {
// //           // Fill remaining days if it's the last week
// //           if (index === yearlyPosts.length - 1 && dayOfWeek < 6) {
// //             for (let i = dayOfWeek + 1; i <= 6; i++) {
// //               currentWeek.push(null);
// //             }
// //           }
          
// //           weeks.push([...currentWeek]);
// //           currentWeek = [];
// //         }
// //       });
// //     }
    
// //     return weeks;
// //   };

// //   // Generate month labels for contribution graph
// //   const getMonthLabels = () => {
// //     if (yearlyPosts.length === 0) return [];
    
// //     const labels = [];
// //     let currentMonth = -1;
    
// //     yearlyPosts.forEach(day => {
// //       const date = new Date(day.date);
// //       const month = date.getMonth();
      
// //       if (month !== currentMonth) {
// //         labels.push({
// //           month: months[month],
// //           index: labels.length
// //         });
// //         currentMonth = month;
// //       }
// //     });
    
// //     return labels;
// //   };

// //   // Calculate the weekly max for scaling the bar chart
// //   const weeklyMax = Math.max(...weeklyActivity.map(day => day.hours || 0), 1);

// //   if (loading) {
// //     return (
// //       <div className="stats-loading">
// //         <div className="stats-loading-spinner"></div>
// //         <p>Loading statistics...</p>
// //       </div>
// //     );
// //   }

// //   // If there's no data even after mock data generation, show an error
// //   if (weeklyActivity.length === 0 || yearlyPosts.length === 0) {
// //     return (
// //       <div className="stats-error">
// //         <p>Unable to load statistics. Please try again later.</p>
// //         <button onClick={generateMockData} className="retry-btn">Generate Sample Data</button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="stats-container">
// //       <div className="stats-tabs">
// //         <button 
// //           className={`stats-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
// //           onClick={() => setActiveTab('weekly')}
// //         >
// //           Weekly Activity
// //         </button>
// //         <button 
// //           className={`stats-tab-btn ${activeTab === 'yearly' ? 'active' : ''}`}
// //           onClick={() => setActiveTab('yearly')}
// //         >
// //           Yearly Contributions
// //         </button>
// //       </div>
      
// //       {statsError && (
// //         <div className="stats-error">
// //           <p>{statsError}</p>
// //           <button onClick={generateMockData} className="retry-btn">
// //             View Sample Data
// //           </button>
// //         </div>
// //       )}
      
// //       <div className={`stats-panel ${activeTab === 'weekly' ? 'active' : ''}`}>
// //         <h3 className="stats-panel-title">Time Active (Last 7 Days)</h3>
// //         <div className="weekly-chart">
// //           {weeklyActivity.map((day, index) => (
// //             <div className="day-column" key={index}>
// //               <div className="bar-container">
// //                 <div 
// //                   className="activity-bar" 
// //                   style={{ height: `${(day.hours / weeklyMax) * 100}%` }}
// //                 >
// //                   <span className="time-tooltip">{day.hours} hr</span>
// //                 </div>
// //               </div>
// //               <div className="day-label">{day.day}</div>
// //             </div>
// //           ))}
// //         </div>
// //         <div className="stats-summary">
// //           <div className="summary-item">
// //             <span className="summary-label">Average Daily Activity:</span>
// //             <span className="summary-value">
// //               {(weeklyActivity.reduce((sum, day) => sum + (day.hours || 0), 0) / 7).toFixed(1)} hrs
// //             </span>
// //           </div>
// //           <div className="summary-item">
// //             <span className="summary-label">Most Active Day:</span>
// //             <span className="summary-value">
// //               {[...weeklyActivity].sort((a, b) => b.hours - a.hours)[0]?.day || 'N/A'}
// //             </span>
// //           </div>
// //         </div>
// //       </div>
      
// //       <div className={`stats-panel ${activeTab === 'yearly' ? 'active' : ''}`}>
// //         <h3 className="stats-panel-title">Post Activity (Last 12 Months)</h3>
// //         <div className="yearly-chart">
// //           <div className="day-labels">
// //             {daysOfWeek.map((day, i) => (
// //               i % 2 === 0 && <div key={day} className="day-label">{day}</div>
// //             ))}
// //           </div>
// //           <div className="contribution-grid">
// //             {groupPostsByWeek().map((week, weekIndex) => (
// //               <div className="week-column" key={weekIndex}>
// //                 {week.map((day, dayIndex) => (
// //                   <div 
// //                     key={dayIndex} 
// //                     className={`contribution-cell ${day ? getCellColor(day.count) : 'empty'}`}
// //                     data-date={day?.date}
// //                     data-count={day?.count || 0}
// //                   >
// //                     {day && (
// //                       <div className="contribution-tooltip">
// //                         <div className="tooltip-date">
// //                           {new Date(day.date).toLocaleDateString('en-US', { 
// //                             month: 'short', 
// //                             day: 'numeric', 
// //                             year: 'numeric' 
// //                           })}
// //                         </div>
// //                         <div className="tooltip-count">
// //                           {day.count} {day.count === 1 ? 'contribution' : 'contributions'}
// //                         </div>
// //                       </div>
// //                     )}
// //                   </div>
// //                 ))}
// //               </div>
// //             ))}
// //           </div>
// //           <div className="month-labels">
// //             {getMonthLabels().map(label => (
// //               <div 
// //                 className="month-label" 
// //                 key={label.month} 
// //                 style={{ left: `${(label.index / getMonthLabels().length) * 100}%` }}
// //               >
// //                 {label.month}
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //         <div className="contribution-legend">
// //           <span className="legend-label">Less</span>
// //           <div className="legend-cells">
// //             <div className="contribution-cell empty"></div>
// //             <div className="contribution-cell light"></div>
// //             <div className="contribution-cell medium"></div>
// //             <div className="contribution-cell dark"></div>
// //           </div>
// //           <span className="legend-label">More</span>
// //         </div>
// //         <div className="stats-summary">
// //           <div className="summary-item">
// //             <span className="summary-label">Total Contributions:</span>
// //             <span className="summary-value">
// //               {yearlyPosts.reduce((sum, day) => sum + (day.count || 0), 0)}
// //             </span>
// //           </div>
// //           <div className="summary-item">
// //             <span className="summary-label">Current Streak:</span>
// //             <span className="summary-value">
// //               {(() => {
// //                 let streak = 0;
// //                 for (let i = yearlyPosts.length - 1; i >= 0; i--) {
// //                   if (yearlyPosts[i].count > 0) streak++;
// //                   else break;
// //                 }
// //                 return streak;
// //               })()} days
// //             </span>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default UserStats;


// // import React, { useState, useEffect } from 'react';
// // import '../styles/userstats.css';

// // const UserStats = ({ user }) => {
// //   const [loading, setLoading] = useState(true);
// //   const [weeklyActivity, setWeeklyActivity] = useState([]);
// //   const [yearlyPosts, setYearlyPosts] = useState([]);
// //   const [activeTab, setActiveTab] = useState('weekly');
// //   const [statsError, setStatsError] = useState(null);

// //   const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// //   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// //   useEffect(() => {
// //     const fetchUserData = () => {
// //       const storedUser = user || JSON.parse(localStorage.getItem("user"));
// //       if (!storedUser || !storedUser.token) {
// //         setStatsError("User authentication required");
// //         setLoading(false);
// //         return null;
// //       }
// //       return storedUser;
// //     };

// //     const userData = fetchUserData();
// //     if (!userData) return;

// //     const fetchUserStats = async () => {
// //       setLoading(true);
// //       setStatsError(null);

// //       try {
// //         const weeklyResponse = await fetch(`http://localhost:5000/api/stats/weekly-activity`, {
// //           headers: {
// //             Authorization: `Bearer ${userData.token}`
// //           }
// //         });

// //         const yearlyResponse = await fetch(`http://localhost:5000/api/stats/yearly-posts`, {
// //           headers: {
// //             Authorization: `Bearer ${userData.token}`
// //           }
// //         });

// //         if (!weeklyResponse.ok || !yearlyResponse.ok) {
// //           throw new Error("Failed to fetch user statistics");
// //         }

// //         const weeklyData = await weeklyResponse.json();
// //         const yearlyData = await yearlyResponse.json();

// //         setWeeklyActivity(weeklyData);
// //         setYearlyPosts(yearlyData);
// //         setLoading(false);
// //       } catch (error) {
// //         console.error("Error fetching statistics:", error);
// //         setStatsError(error.message);
// //         generateMockData();
// //       }
// //     };

// //     fetchUserStats();
// //   }, [user]);

// //   const generateMockData = () => {
// //     console.log("Generating mock data");

// //     const mockWeeklyData = daysOfWeek.map(day => ({
// //       day,
// //       hours: Math.floor(Math.random() * 5) + 1
// //     }));

// //     const today = new Date();
// //     const mockYearlyData = [];

// //     for (let i = 365; i >= 0; i--) {
// //       const date = new Date();
// //       date.setDate(today.getDate() - i);
// //       if (date > today) continue;

// //       mockYearlyData.push({
// //         date: date.toISOString().split('T')[0],
// //         count: Math.floor(Math.random() * 5)
// //       });
// //     }

// //     setWeeklyActivity(mockWeeklyData);
// //     setYearlyPosts(mockYearlyData);
// //     setLoading(false);
// //   };

// //   const getCellColor = (count) => {
// //     if (count === 0) return 'empty';
// //     if (count === 1) return 'light';
// //     if (count === 2) return 'medium';
// //     return 'dark';
// //   };

// //   const groupPostsByWeek = () => {
// //     const postsMap = {};
// //     yearlyPosts.forEach(p => postsMap[p.date] = p.count);

// //     const today = new Date();
// //     const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

// //     const startDate = new Date(endDate);
// //     startDate.setDate(startDate.getDate() - 364);
// //     startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

// //     const weeks = [];
// //     let current = new Date(startDate);

// //     while (current <= endDate) {
// //       const week = [];
// //       for (let i = 0; i < 7; i++) {
// //         const dateStr = current.toISOString().split('T')[0];
// //         if (current <= endDate) {
// //           week.push({
// //             date: dateStr,
// //             count: postsMap[dateStr] || 0,
// //           });
// //         } else {
// //           week.push(null); // pad future dates with null
// //         }
// //         current.setDate(current.getDate() + 1);
// //       }
// //       weeks.push(week);
// //     }

// //     return weeks;
// //   };

// //   const getMonthLabels = () => {
// //     if (yearlyPosts.length === 0) return [];

// //     const labels = [];
// //     let lastMonth = -1;

// //     groupPostsByWeek().forEach((week, index) => {
// //       const firstDay = week.find(day => day !== null);
// //       if (firstDay) {
// //         const date = new Date(firstDay.date);
// //         const month = date.getMonth();
// //         if (month !== lastMonth) {
// //           labels.push({
// //             month: months[month],
// //             index,
// //           });
// //           lastMonth = month;
// //         }
// //       }
// //     });

// //     return labels;
// //   };

// //   const weeklyMax = Math.max(...weeklyActivity.map(day => day.hours || 0), 1);

// //   if (loading) {
// //     return (
// //       <div className="stats-loading">
// //         <div className="stats-loading-spinner"></div>
// //         <p>Loading statistics...</p>
// //       </div>
// //     );
// //   }

// //   if (weeklyActivity.length === 0 || yearlyPosts.length === 0) {
// //     return (
// //       <div className="stats-error">
// //         <p>Unable to load statistics. Please try again later.</p>
// //         <button onClick={generateMockData} className="retry-btn">Generate Sample Data</button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="stats-container">
// //       <div className="stats-tabs">
// //         <button 
// //           className={`stats-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
// //           onClick={() => setActiveTab('weekly')}
// //         >
// //           Weekly Activity
// //         </button>
// //         <button 
// //           className={`stats-tab-btn ${activeTab === 'yearly' ? 'active' : ''}`}
// //           onClick={() => setActiveTab('yearly')}
// //         >
// //           Yearly Contributions
// //         </button>
// //       </div>

// //       {statsError && (
// //         <div className="stats-error">
// //           <p>{statsError}</p>
// //           <button onClick={generateMockData} className="retry-btn">View Sample Data</button>
// //         </div>
// //       )}

// //       <div className={`stats-panel ${activeTab === 'weekly' ? 'active' : ''}`}>
// //         <h3 className="stats-panel-title">Time Active (Last 7 Days)</h3>
// //         <div className="weekly-chart">
// //           {weeklyActivity.map((day, index) => (
// //             <div className="day-column" key={index}>
// //               <div className="bar-container">
// //                 <div 
// //                   className="activity-bar" 
// //                   style={{ height: `${(day.hours / weeklyMax) * 100}%` }}
// //                 >
// //                   <span className="time-tooltip">{day.hours} hr</span>
// //                 </div>
// //               </div>
// //               <div className="day-label">{day.day}</div>
// //             </div>
// //           ))}
// //         </div>
// //         <div className="stats-summary">
// //           <div className="summary-item">
// //             <span className="summary-label">Average Daily Activity:</span>
// //             <span className="summary-value">
// //               {(weeklyActivity.reduce((sum, day) => sum + (day.hours || 0), 0) / 7).toFixed(1)} hrs
// //             </span>
// //           </div>
// //           <div className="summary-item">
// //             <span className="summary-label">Most Active Day:</span>
// //             <span className="summary-value">
// //               {[...weeklyActivity].sort((a, b) => b.hours - a.hours)[0]?.day || 'N/A'}
// //             </span>
// //           </div>
// //         </div>
// //       </div>

// //       <div className={`stats-panel ${activeTab === 'yearly' ? 'active' : ''}`}>
// //         <h3 className="stats-panel-title">Post Activity (Last 12 Months)</h3>
// //         <div className="yearly-chart">
// //           <div className="day-labels">
// //             {daysOfWeek.map((day, i) => (
// //               i % 2 === 0 && <div key={day} className="day-label">{day}</div>
// //             ))}
// //           </div>
// //           <div className="contribution-grid">
// //             {groupPostsByWeek().map((week, weekIndex) => (
// //               <div className="week-column" key={weekIndex}>
// //                 {week.map((day, dayIndex) => (
// //                   <div 
// //                     key={dayIndex} 
// //                     className={`contribution-cell ${day ? getCellColor(day.count) : 'empty'}`}
// //                     data-date={day?.date}
// //                     data-count={day?.count || 0}
// //                   >
// //                     {day && (
// //                       <div className="contribution-tooltip">
// //                         <div className="tooltip-date">
// //                           {new Date(day.date).toLocaleDateString('en-US', { 
// //                             month: 'short', 
// //                             day: 'numeric', 
// //                             year: 'numeric' 
// //                           })}
// //                         </div>
// //                         <div className="tooltip-count">
// //                           {day.count} {day.count === 1 ? 'contribution' : 'contributions'}
// //                         </div>
// //                       </div>
// //                     )}
// //                   </div>
// //                 ))}
// //               </div>
// //             ))}
// //           </div>
// //           <div className="month-labels">
// //             {getMonthLabels().map(label => (
// //               <div 
// //                 className="month-label" 
// //                 key={label.month} 
// //                 style={{ left: `${(label.index / groupPostsByWeek().length) * 100}%` }}
// //               >
// //                 {label.month}
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //         <div className="contribution-legend">
// //           <span className="legend-label">Less</span>
// //           <div className="legend-cells">
// //             <div className="contribution-cell empty"></div>
// //             <div className="contribution-cell light"></div>
// //             <div className="contribution-cell medium"></div>
// //             <div className="contribution-cell dark"></div>
// //           </div>
// //           <span className="legend-label">More</span>
// //         </div>
// //         <div className="stats-summary">
// //           <div className="summary-item">
// //             <span className="summary-label">Total Contributions:</span>
// //             <span className="summary-value">
// //               {yearlyPosts.reduce((sum, day) => sum + (day.count || 0), 0)}
// //             </span>
// //           </div>
// //           <div className="summary-item">
// //             <span className="summary-label">Current Streak:</span>
// //             <span className="summary-value">
// //               {(() => {
// //                 let streak = 0;
// //                 for (let i = yearlyPosts.length - 1; i >= 0; i--) {
// //                   if (yearlyPosts[i].count > 0) streak++;
// //                   else break;
// //                 }
// //                 return streak;
// //               })()} days
// //             </span>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default UserStats;



// import React, { useState, useEffect } from 'react';
// import '../styles/userstats.css';

// const UserStats = ({ user }) => {
//   const [loading, setLoading] = useState(true);
//   const [weeklyActivity, setWeeklyActivity] = useState([]);
//   const [yearlyPosts, setYearlyPosts] = useState([]);
//   const [activeTab, setActiveTab] = useState('weekly');
//   const [statsError, setStatsError] = useState(null);

//   const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//   useEffect(() => {
//     const fetchUserData = () => {
//       const storedUser = user || JSON.parse(localStorage.getItem("user"));
//       if (!storedUser || !storedUser.token) {
//         setStatsError("User authentication required");
//         setLoading(false);
//         return null;
//       }
//       return storedUser;
//     };

//     const userData = fetchUserData();
//     if (!userData) return;

//     const fetchUserStats = async () => {
//       setLoading(true);
//       setStatsError(null);

//       try {
//         const weeklyResponse = await fetch(`http://localhost:5000/api/stats/weekly-activity`, {
//           headers: {
//             Authorization: `Bearer ${userData.token}`
//           }
//         });

//         const yearlyResponse = await fetch(`http://localhost:5000/api/stats/yearly-posts`, {
//           headers: {
//             Authorization: `Bearer ${userData.token}`
//           }
//         });

//         if (!weeklyResponse.ok || !yearlyResponse.ok) {
//           throw new Error("Failed to fetch user statistics");
//         }

//         const weeklyData = await weeklyResponse.json();
//         const yearlyData = await yearlyResponse.json();

//         setWeeklyActivity(weeklyData);
//         setYearlyPosts(yearlyData);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching statistics:", error);
//         setStatsError(error.message);
//         generateMockData();
//       }
//     };

//     fetchUserStats();
//   }, [user]);

//   const generateMockData = () => {
//     console.log("Generating mock data");

//     const mockWeeklyData = daysOfWeek.map(day => ({
//       day,
//       hours: Math.floor(Math.random() * 5) + 1
//     }));

//     const today = new Date();
//     const mockYearlyData = [];

//     for (let i = 365; i >= 0; i--) {
//       const date = new Date();
//       date.setDate(today.getDate() - i);
//       if (date > today) continue;

//       mockYearlyData.push({
//         date: date.toISOString().split('T')[0],
//         count: Math.floor(Math.random() * 5)
//       });
//     }

//     setWeeklyActivity(mockWeeklyData);
//     setYearlyPosts(mockYearlyData);
//     setLoading(false);
//   };

//   const getCellColor = (count) => {
//     if (count === 0) return 'empty';
//     if (count === 1) return 'light';
//     if (count === 2) return 'medium';
//     return 'dark';
//   };

//   const groupPostsByWeek = () => {
//     const postsMap = {};
//     yearlyPosts.forEach(p => postsMap[p.date] = p.count);

//     const today = new Date();
//     const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

//     const startDate = new Date(endDate);
//     startDate.setDate(startDate.getDate() - 364);
//     startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

//     const weeks = [];
//     let current = new Date(startDate);

//     while (current <= endDate) {
//       const week = [];
//       for (let i = 0; i < 7; i++) {
//         const dateStr = current.toISOString().split('T')[0];
//         if (current <= endDate) {
//           week.push({
//             date: dateStr,
//             count: postsMap[dateStr] || 0,
//           });
//         } else {
//           week.push(null); // pad future dates with null
//         }
//         current.setDate(current.getDate() + 1);
//       }
//       weeks.push(week);
//     }

//     return weeks;
//   };

//   const getMonthLabels = () => {
//     const labels = [];
//     const weeks = groupPostsByWeek();

//     let lastMonth = -1;
//     weeks.forEach((week, weekIndex) => {
//       const firstValidDay = week.find(day => day !== null);
//       if (firstValidDay) {
//         const date = new Date(firstValidDay.date);
//         const month = date.getMonth();
//         if (month !== lastMonth) {
//           labels.push({ month: months[month], weekIndex });
//           lastMonth = month;
//         }
//       }
//     });

//     return labels;
//   };

//   const weeklyMax = Math.max(...weeklyActivity.map(day => day.hours || 0), 1);

//   if (loading) {
//     return (
//       <div className="stats-loading">
//         <div className="stats-loading-spinner"></div>
//         <p>Loading statistics...</p>
//       </div>
//     );
//   }

//   if (weeklyActivity.length === 0 || yearlyPosts.length === 0) {
//     return (
//       <div className="stats-error">
//         <p>Unable to load statistics. Please try again later.</p>
//         <button onClick={generateMockData} className="retry-btn">Generate Sample Data</button>
//       </div>
//     );
//   }

//   return (
//     <div className="stats-container">
//       <div className="stats-tabs">
//         <button 
//           className={`stats-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
//           onClick={() => setActiveTab('weekly')}
//         >
//           Weekly Activity
//         </button>
//         <button 
//           className={`stats-tab-btn ${activeTab === 'yearly' ? 'active' : ''}`}
//           onClick={() => setActiveTab('yearly')}
//         >
//           Yearly Contributions
//         </button>
//       </div>

//       {statsError && (
//         <div className="stats-error">
//           <p>{statsError}</p>
//           <button onClick={generateMockData} className="retry-btn">View Sample Data</button>
//         </div>
//       )}

//       <div className={`stats-panel ${activeTab === 'weekly' ? 'active' : ''}`}>
//         <h3 className="stats-panel-title">Time Active (Last 7 Days)</h3>
//         <div className="weekly-chart">
//           {weeklyActivity.map((day, index) => (
//             <div className="day-column" key={index}>
//               <div className="bar-container">
//                 <div 
//                   className="activity-bar" 
//                   style={{ height: `${(day.hours / weeklyMax) * 100}%` }}
//                 >
//                   <span className="time-tooltip">{day.hours} hr</span>
//                 </div>
//               </div>
//               <div className="day-label">{day.day}</div>
//             </div>
//           ))}
//         </div>
//         <div className="stats-summary">
//           <div className="summary-item">
//             <span className="summary-label">Average Daily Activity:</span>
//             <span className="summary-value">
//               {(weeklyActivity.reduce((sum, day) => sum + (day.hours || 0), 0) / 7).toFixed(1)} hrs
//             </span>
//           </div>
//           <div className="summary-item">
//             <span className="summary-label">Most Active Day:</span>
//             <span className="summary-value">
//               {[...weeklyActivity].sort((a, b) => b.hours - a.hours)[0]?.day || 'N/A'}
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className={`stats-panel ${activeTab === 'yearly' ? 'active' : ''}`}>
//         <h3 className="stats-panel-title">Post Activity (Last 12 Months)</h3>
//         <div className="yearly-chart">
//           <div className="day-labels">
//             {daysOfWeek.map((day, i) => (
//               i % 2 === 0 && <div key={day} className="day-label">{day}</div>
//             ))}
//           </div>
//           <div className="contribution-grid">
//             {groupPostsByWeek().map((week, weekIndex) => (
//               <div className="week-column" key={weekIndex}>
//                 {week.map((day, dayIndex) => (
//                   <div 
//                     key={dayIndex} 
//                     className={`contribution-cell ${day ? getCellColor(day.count) : 'empty'}`}
//                     data-date={day?.date}
//                     data-count={day?.count || 0}
//                   >
//                     {day && (
//                       <div className="contribution-tooltip">
//                         <div className="tooltip-date">
//                           {new Date(day.date).toLocaleDateString('en-US', { 
//                             month: 'short', 
//                             day: 'numeric', 
//                             year: 'numeric' 
//                           })}
//                         </div>
//                         <div className="tooltip-count">
//                           {day.count} {day.count === 1 ? 'contribution' : 'contributions'}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//           <div className="month-labels">
//             {getMonthLabels().map(label => (
//               <div 
//                 className="month-label" 
//                 key={label.month} 
//                 style={{ gridColumn: `${label.weekIndex + 1}` }}
//               >
//                 {label.month}
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="contribution-legend">
//           <span className="legend-label">Less</span>
//           <div className="legend-cells">
//             <div className="contribution-cell empty"></div>
//             <div className="contribution-cell light"></div>
//             <div className="contribution-cell medium"></div>
//             <div className="contribution-cell dark"></div>
//           </div>
//           <span className="legend-label">More</span>
//         </div>
//         <div className="stats-summary">
//           <div className="summary-item">
//             <span className="summary-label">Total Contributions:</span>
//             <span className="summary-value">
//               {yearlyPosts.reduce((sum, day) => sum + (day.count || 0), 0)}
//             </span>
//           </div>
//           <div className="summary-item">
//             <span className="summary-label">Current Streak:</span>
//             <span className="summary-value">
//               {(() => {
//                 let streak = 0;
//                 for (let i = yearlyPosts.length - 1; i >= 0; i--) {
//                   if (yearlyPosts[i].count > 0) streak++;
//                   else break;
//                 }
//                 return streak;
//               })()} days
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserStats;



import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import '../styles/userstats.css';

const UserStats = ({ user }) => {
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [yearlyPosts, setYearlyPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');
  const [statsError, setStatsError] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const fetchUserData = () => {
      const storedUser = user || JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser.token) {
        setStatsError("User authentication required");
        setWeeklyLoading(false);
        setYearlyLoading(false);
        return null;
      }
      return storedUser;
    };

    const userData = fetchUserData();
    if (!userData) return;

    const fetchUserStats = async () => {
      try {
        setWeeklyLoading(true);
        setYearlyLoading(true);
        setStatsError(null);

        const [weeklyResponse, yearlyResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/stats/weekly-activity`, {
            headers: { Authorization: `Bearer ${userData.token}` }
          }),
          fetch(`http://localhost:5000/api/stats/yearly-posts`, {
            headers: { Authorization: `Bearer ${userData.token}` }
          })
        ]);

        if (!weeklyResponse.ok || !yearlyResponse.ok) {
          throw new Error("Failed to fetch user statistics");
        }

        const [weeklyData, yearlyData] = await Promise.all([
          weeklyResponse.json(),
          yearlyResponse.json()
        ]);

        setWeeklyActivity(weeklyData);
        setYearlyPosts(yearlyData);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStatsError(error.message);
        generateMockData();
      } finally {
        setWeeklyLoading(false);
        setYearlyLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  const generateMockData = () => {
    const mockWeeklyData = daysOfWeek.map(day => ({
      day,
      hours: Math.floor(Math.random() * 5) + 1
    }));

    const today = new Date();
    const mockYearlyData = [];

    for (let i = 365; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      if (date > today) continue;

      mockYearlyData.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5)
      });
    }

    setWeeklyActivity(mockWeeklyData);
    setYearlyPosts(mockYearlyData);
  };

  const getCellColor = (count) => {
    if (count === 0) return 'empty';
    if (count === 1) return 'light';
    if (count === 2) return 'medium';
    return 'dark';
  };

  const groupPostsByWeek = () => {
    const postsMap = {};
    yearlyPosts.forEach(p => postsMap[p.date] = p.count);

    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

    const weeks = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = current.toISOString().split('T')[0];
        if (current <= endDate) {
          week.push({
            date: dateStr,
            count: postsMap[dateStr] || 0,
          });
        } else {
          week.push(null);
        }
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  };

  const getMonthLabels = (weeks) => {
    const labels = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(day => day !== null);
      if (firstValidDay) {
        const date = new Date(firstValidDay.date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: months[month], weekIndex });
          lastMonth = month;
        }
      }
    });

    return labels;
  };

  // Memoize expensive calculations
  const groupedWeeks = useMemo(() => groupPostsByWeek(), [yearlyPosts]);
  const monthLabels = useMemo(() => getMonthLabels(groupedWeeks), [groupedWeeks]);
  const weeklyMax = useMemo(() => Math.max(...weeklyActivity.map(day => day.hours || 0), 1), [weeklyActivity]);

  const renderLoading = () => (
    <div className="stats-loading">
      <div className="stats-loading-spinner" aria-label="Loading"></div>
      <p>Loading statistics...</p>
    </div>
  );

  const renderError = () => (
    <div className="stats-error" role="alert">
      <p>{statsError}</p>
      <button onClick={generateMockData} className="retry-btn">
        View Sample Data
      </button>
    </div>
  );

  const renderWeeklyPanel = () => (
    <div className={`stats-panel ${activeTab === 'weekly' ? 'active' : ''}`}>
      <h3 className="stats-panel-title">Time Active (Last 7 Days)</h3>
      {weeklyLoading ? renderLoading() : (
        <>
          <div className="weekly-chart" aria-label="Weekly activity chart">
            {weeklyActivity.map((day, index) => (
              <div className="day-column" key={index}>
                <div className="bar-container">
                  <div 
                    className="activity-bar" 
                    style={{ height: `${(day.hours / weeklyMax) * 100}%` }}
                    aria-label={`${day.day}: ${day.hours} hours`}
                  >
                    <span className="time-tooltip">{day.hours} hr</span>
                  </div>
                </div>
                <div className="day-label">{day.day}</div>
              </div>
            ))}
          </div>
          <div className="stats-summary">
            <div className="summary-item">
              <span className="summary-label">Average Daily Activity:</span>
              <span className="summary-value">
                {(weeklyActivity.reduce((sum, day) => sum + (day.hours || 0), 0) / 7).toFixed(1)} hrs
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Most Active Day:</span>
              <span className="summary-value">
                {[...weeklyActivity].sort((a, b) => b.hours - a.hours)[0]?.day || 'N/A'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderYearlyPanel = () => (
    <div className={`stats-panel ${activeTab === 'yearly' ? 'active' : ''}`}>
      <h3 className="stats-panel-title">Post Activity (Last 12 Months)</h3>
      {yearlyLoading ? renderLoading() : (
        <>
          <div className="yearly-chart">
            <div className="day-labels" aria-hidden="true">
              {daysOfWeek.map((day, i) => (
                i % 2 === 0 && <div key={day} className="day-label">{day}</div>
              ))}
            </div>
            <div className="contribution-grid" role="grid">
              {groupedWeeks.map((week, weekIndex) => (
                <div className="week-column" key={weekIndex} role="row">
                  {week.map((day, dayIndex) => (
                    <div 
                      key={dayIndex}
                      className={`contribution-cell ${day ? getCellColor(day.count) : 'empty'}`}
                      data-date={day?.date}
                      data-count={day?.count || 0}
                      role="gridcell"
                      aria-label={day ? 
                        `${new Date(day.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}: ${day.count} ${day.count === 1 ? 'contribution' : 'contributions'}` : 
                        'No activity'}
                    >
                      {day && (
                        <div className="contribution-tooltip">
                          <div className="tooltip-date">
                            {new Date(day.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="tooltip-count">
                            {day.count} {day.count === 1 ? 'contribution' : 'contributions'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="month-labels" aria-hidden="true">
              {monthLabels.map(label => (
                <div 
                  className="month-label" 
                  key={label.month} 
                  style={{ gridColumn: `${label.weekIndex + 1}` }}
                >
                  {label.month}
                </div>
              ))}
            </div>
          </div>
          <div className="contribution-legend">
            <span className="legend-label">Less</span>
            <div className="legend-cells">
              <div className="contribution-cell empty"></div>
              <div className="contribution-cell light"></div>
              <div className="contribution-cell medium"></div>
              <div className="contribution-cell dark"></div>
            </div>
            <span className="legend-label">More</span>
          </div>
          <div className="stats-summary">
            <div className="summary-item">
              <span className="summary-label">Total Contributions:</span>
              <span className="summary-value">
                {yearlyPosts.reduce((sum, day) => sum + (day.count || 0), 0)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Current Streak:</span>
              <span className="summary-value">
                {(() => {
                  let streak = 0;
                  for (let i = yearlyPosts.length - 1; i >= 0; i--) {
                    if (yearlyPosts[i].count > 0) streak++;
                    else break;
                  }
                  return streak;
                })()} days
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="stats-container">
      <div className="stats-tabs" role="tablist">
        <button 
          className={`stats-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
          role="tab"
          aria-selected={activeTab === 'weekly'}
          aria-controls="weekly-panel"
        >
          Weekly Activity
        </button>
        <button 
          className={`stats-tab-btn ${activeTab === 'yearly' ? 'active' : ''}`}
          onClick={() => setActiveTab('yearly')}
          role="tab"
          aria-selected={activeTab === 'yearly'}
          aria-controls="yearly-panel"
        >
          Yearly Contributions
        </button>
      </div>

      {statsError && renderError()}

      {renderWeeklyPanel()}
      {renderYearlyPanel()}
    </div>
  );
};

UserStats.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string.isRequired,
    // Add other user properties if needed
  })
};

export default UserStats;