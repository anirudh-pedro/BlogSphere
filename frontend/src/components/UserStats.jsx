
// import React, { useState, useEffect, useMemo } from 'react';
// import PropTypes from 'prop-types';
// import '../styles/userstats.css';

// const UserStats = ({ user }) => {
//   const [weeklyActivity, setWeeklyActivity] = useState([]);
//   const [yearlyPosts, setYearlyPosts] = useState([]);
//   const [activeTab, setActiveTab] = useState('weekly');
//   const [statsError, setStatsError] = useState(null);
//   const [weeklyLoading, setWeeklyLoading] = useState(false);
//   const [yearlyLoading, setYearlyLoading] = useState(false);

//   const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//   useEffect(() => {
//     const fetchUserData = () => {
//       const storedUser = user || JSON.parse(localStorage.getItem("user"));
//       if (!storedUser || !storedUser.token) {
//         setStatsError("User authentication required");
//         setWeeklyLoading(false);
//         setYearlyLoading(false);
//         return null;
//       }
//       return storedUser;
//     };

//     const userData = fetchUserData();
//     if (!userData) return;

//     const fetchUserStats = async () => {
//       try {
//         setWeeklyLoading(true);
//         setYearlyLoading(true);
//         setStatsError(null);

//         const [weeklyResponse, yearlyResponse] = await Promise.all([
//           fetch(`http://localhost:5000/api/stats/weekly-activity`, {
//             headers: { Authorization: `Bearer ${userData.token}` }
//           }),
//           fetch(`http://localhost:5000/api/stats/yearly-posts`, {
//             headers: { Authorization: `Bearer ${userData.token}` }
//           })
//         ]);

//         if (!weeklyResponse.ok || !yearlyResponse.ok) {
//           throw new Error("Failed to fetch user statistics");
//         }

//         const [weeklyData, yearlyData] = await Promise.all([
//           weeklyResponse.json(),
//           yearlyResponse.json()
//         ]);

//         setWeeklyActivity(weeklyData);
//         setYearlyPosts(yearlyData);
//       } catch (error) {
//         console.error("Error fetching statistics:", error);
//         setStatsError(error.message);
//         generateMockData();
//       } finally {
//         setWeeklyLoading(false);
//         setYearlyLoading(false);
//       }
//     };

//     fetchUserStats();
//   }, [user]);

//   const generateMockData = () => {
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
//           week.push(null);
//         }
//         current.setDate(current.getDate() + 1);
//       }
//       weeks.push(week);
//     }

//     return weeks;
//   };

//   const getMonthLabels = (weeks) => {
//     const labels = [];
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

//   // Memoize expensive calculations
//   const groupedWeeks = useMemo(() => groupPostsByWeek(), [yearlyPosts]);
//   const monthLabels = useMemo(() => getMonthLabels(groupedWeeks), [groupedWeeks]);
//   const weeklyMax = useMemo(() => Math.max(...weeklyActivity.map(day => day.hours || 0), 1), [weeklyActivity]);

//   const renderLoading = () => (
//     <div className="stats-loading">
//       <div className="stats-loading-spinner" aria-label="Loading"></div>
//       <p>Loading statistics...</p>
//     </div>
//   );

//   const renderError = () => (
//     <div className="stats-error" role="alert">
//       <p>{statsError}</p>
//       <button onClick={generateMockData} className="retry-btn">
//         View Sample Data
//       </button>
//     </div>
//   );

//   const renderWeeklyPanel = () => (
//     <div className={`stats-panel ${activeTab === 'weekly' ? 'active' : ''}`}>
//       <h3 className="stats-panel-title">Time Active (Last 7 Days)</h3>
//       {weeklyLoading ? renderLoading() : (
//         <>
//           <div className="weekly-chart" aria-label="Weekly activity chart">
//             {weeklyActivity.map((day, index) => (
//               <div className="day-column" key={index}>
//                 <div className="bar-container">
//                   <div 
//                     className="activity-bar" 
//                     style={{ height: `${(day.hours / weeklyMax) * 100}%` }}
//                     aria-label={`${day.day}: ${day.hours} hours`}
//                   >
//                     <span className="time-tooltip">{day.hours} hr</span>
//                   </div>
//                 </div>
//                 <div className="day-label">{day.day}</div>
//               </div>
//             ))}
//           </div>
//           <div className="stats-summary">
//             <div className="summary-item">
//               <span className="summary-label">Average Daily Activity:</span>
//               <span className="summary-value">
//                 {(weeklyActivity.reduce((sum, day) => sum + (day.hours || 0), 0) / 7).toFixed(1)} hrs
//               </span>
//             </div>
//             <div className="summary-item">
//               <span className="summary-label">Most Active Day:</span>
//               <span className="summary-value">
//                 {[...weeklyActivity].sort((a, b) => b.hours - a.hours)[0]?.day || 'N/A'}
//               </span>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );

//   const renderYearlyPanel = () => (
//     <div className={`stats-panel ${activeTab === 'yearly' ? 'active' : ''}`}>
//       <h3 className="stats-panel-title">Post Activity (Last 12 Months)</h3>
//       {yearlyLoading ? renderLoading() : (
//         <>
//           <div className="yearly-chart">
//             <div className="day-labels" aria-hidden="true">
//               {daysOfWeek.map((day, i) => (
//                 i % 2 === 0 && <div key={day} className="day-label">{day}</div>
//               ))}
//             </div>
//             <div className="contribution-grid" role="grid">
//               {groupedWeeks.map((week, weekIndex) => (
//                 <div className="week-column" key={weekIndex} role="row">
//                   {week.map((day, dayIndex) => (
//                     <div 
//                       key={dayIndex}
//                       className={`contribution-cell ${day ? getCellColor(day.count) : 'empty'}`}
//                       data-date={day?.date}
//                       data-count={day?.count || 0}
//                       role="gridcell"
//                       aria-label={day ? 
//                         `${new Date(day.date).toLocaleDateString('en-US', { 
//                           month: 'short', 
//                           day: 'numeric', 
//                           year: 'numeric' 
//                         })}: ${day.count} ${day.count === 1 ? 'contribution' : 'contributions'}` : 
//                         'No activity'}
//                     >
//                       {day && (
//                         <div className="contribution-tooltip">
//                           <div className="tooltip-date">
//                             {new Date(day.date).toLocaleDateString('en-US', { 
//                               month: 'short', 
//                               day: 'numeric', 
//                               year: 'numeric' 
//                             })}
//                           </div>
//                           <div className="tooltip-count">
//                             {day.count} {day.count === 1 ? 'contribution' : 'contributions'}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//             <div className="month-labels" aria-hidden="true">
//               {monthLabels.map(label => (
//                 <div 
//                   className="month-label" 
//                   key={label.month} 
//                   style={{ gridColumn: `${label.weekIndex + 1}` }}
//                 >
//                   {label.month}
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="contribution-legend">
//             <span className="legend-label">Less</span>
//             <div className="legend-cells">
//               <div className="contribution-cell empty"></div>
//               <div className="contribution-cell light"></div>
//               <div className="contribution-cell medium"></div>
//               <div className="contribution-cell dark"></div>
//             </div>
//             <span className="legend-label">More</span>
//           </div>
//           <div className="stats-summary">
//             <div className="summary-item">
//               <span className="summary-label">Total Contributions:</span>
//               <span className="summary-value">
//                 {yearlyPosts.reduce((sum, day) => sum + (day.count || 0), 0)}
//               </span>
//             </div>
//             <div className="summary-item">
//               <span className="summary-label">Current Streak:</span>
//               <span className="summary-value">
//                 {(() => {
//                   let streak = 0;
//                   for (let i = yearlyPosts.length - 1; i >= 0; i--) {
//                     if (yearlyPosts[i].count > 0) streak++;
//                     else break;
//                   }
//                   return streak;
//                 })()} days
//               </span>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );

//   return (
//     <div className="stats-container">
//       <div className="stats-tabs" role="tablist">
//         <button 
//           className={`stats-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
//           onClick={() => setActiveTab('weekly')}
//           role="tab"
//           aria-selected={activeTab === 'weekly'}
//           aria-controls="weekly-panel"
//         >
//           Weekly Activity
//         </button>
//         <button 
//           className={`stats-tab-btn ${activeTab === 'yearly' ? 'active' : ''}`}
//           onClick={() => setActiveTab('yearly')}
//           role="tab"
//           aria-selected={activeTab === 'yearly'}
//           aria-controls="yearly-panel"
//         >
//           Yearly Contributions
//         </button>
//       </div>

//       {statsError && renderError()}

//       {renderWeeklyPanel()}
//       {renderYearlyPanel()}
//     </div>
//   );
// };

// UserStats.propTypes = {
//   user: PropTypes.shape({
//     token: PropTypes.string.isRequired,
//     // Add other user properties if needed
//   })
// };

// export default UserStats;


import React, { useState, useEffect, useMemo } from 'react';

const UserStats = ({ user }) => {
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [yearlyPosts, setYearlyPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('yearly');
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

        // Simulate API call with timeout
        setTimeout(() => {
          generateMockData();
          setWeeklyLoading(false);
          setYearlyLoading(false);
        }, 1000);

      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStatsError(error.message);
        generateMockData();
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

  // Function to check if a year is a leap year
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Function to get days in a month, accounting for leap years
  const getDaysInMonth = (year, month) => {
    const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonth[month];
  };

  // Organize posts by month with proper day counts
  const organizePostsByMonth = () => {
    const postsMap = {};
    yearlyPosts.forEach(p => postsMap[p.date] = p.count);

    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 364);

    const monthsData = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const monthName = months[month];
      const daysInMonth = getDaysInMonth(year, month);
      
      const days = [];
      const monthStart = new Date(year, month, 1);
      const startDayOfWeek = monthStart.getDay();
      
      // Add days in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date > endDate) break;
        if (date < startDate) continue;
        
        const dateStr = date.toISOString().split('T')[0];
        days.push({
          date: dateStr,
          count: postsMap[dateStr] || 0,
          dayOfWeek: date.getDay()
        });
      }
      
      if (days.length > 0) {
        monthsData.push({
          year,
          month,
          monthName,
          days,
          startDayOfWeek
        });
      }
      
      // Move to next month
      currentDate = new Date(year, month + 1, 1);
    }
    
    return monthsData;
  };

  // Memoize expensive calculations
  const monthsData = useMemo(() => organizePostsByMonth(), [yearlyPosts]);
  const weeklyMax = useMemo(() => Math.max(...weeklyActivity.map(day => day.hours || 0), 1), [weeklyActivity]);
  
  // Calculate total contributions and current streak
  const totalContributions = useMemo(
    () => yearlyPosts.reduce((sum, day) => sum + (day.count || 0), 0),
    [yearlyPosts]
  );
  
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = yearlyPosts.length - 1; i >= 0; i--) {
      if (yearlyPosts[i].count > 0) streak++;
      else break;
    }
    return streak;
  }, [yearlyPosts]);

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-10 min-h-52">
      <div className="w-10 h-10 border-3 border-gray-200 rounded-full border-t-teal-500 animate-spin mb-4"></div>
      <p className="text-gray-500 text-sm">Loading statistics...</p>
    </div>
  );

  const renderError = () => (
    <div className="bg-red-50 border border-red-200 rounded p-4 mb-5 text-center text-red-700">
      <p className="mb-2">{statsError}</p>
      <button 
        onClick={generateMockData} 
        className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700"
      >
        View Sample Data
      </button>
    </div>
  );

  const renderWeeklyPanel = () => (
    <div className={`${activeTab === 'weekly' ? 'block' : 'hidden'} animate-fadeIn`}>
      <h3 className="text-lg font-medium mb-8 text-gray-800 mt-2">Time Active (Last 7 Days)</h3>
      {weeklyLoading ? renderLoading() : (
        <>
          <div className="flex justify-between items-end h-40 md:h-48 mb-6 gap-1">
            {weeklyActivity.map((day, index) => (
              <div className="flex flex-col items-center w-1/7" key={index}>
                <div className="h-full w-full flex items-end justify-center relative">
                  <div 
                    className="bg-teal-500 rounded-t w-full max-w-6 md:max-w-7 hover:bg-teal-600 transition-colors min-h-1"
                    style={{ height: `${(day.hours / weeklyMax) * 100}%` }}
                    aria-label={`${day.day}: ${day.hours} hours`}
                  >
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 hover:opacity-100 pointer-events-none z-10">
                      {day.hours} hr
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">{day.day}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-6 flex flex-wrap gap-6 mt-4">
            <div className="flex-grow lg:flex-1 min-w-48">
              <span className="text-sm text-gray-500 mr-2">Average Daily Activity:</span>
              <span className="text-sm font-medium text-gray-800">
                {(weeklyActivity.reduce((sum, day) => sum + (day.hours || 0), 0) / 7).toFixed(1)} hrs
              </span>
            </div>
            <div className="flex-grow lg:flex-1 min-w-48">
              <span className="text-sm text-gray-500 mr-2">Most Active Day:</span>
              <span className="text-sm font-medium text-gray-800">
                {[...weeklyActivity].sort((a, b) => b.hours - a.hours)[0]?.day || 'N/A'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderYearlyPanel = () => (
    <div className={`${activeTab === 'yearly' ? 'block' : 'hidden'} animate-fadeIn`}>
      <h3 className="text-lg font-medium mb-8 text-gray-800 mt-2">Post Activity (Last 12 Months)</h3>
      {yearlyLoading ? renderLoading() : (
        <>
          <div className="relative pl-10 pb-8 mb-6 overflow-x-auto max-w-full">
            <div className="absolute left-0 top-0 flex flex-col justify-between h-full pt-10 pb-5">
              {daysOfWeek.filter((_, i) => i % 2 === 0).map((day) => (
                <div key={day} className="text-xs text-gray-500">{day}</div>
              ))}
            </div>
            
            <div className="flex items-start space-x-6 pb-2 pt-2 flex-nowrap overflow-x-auto scrollbar-thin">
              {monthsData.map((monthData, monthIndex) => (
                <div key={`${monthData.year}-${monthData.month}`} className="flex flex-col min-w-fit">
                  <div className="text-xs text-gray-500 h-6 mb-2 pl-1 font-medium">
                    {monthData.monthName}
                  </div>
                  <div className="grid grid-rows-7 grid-flow-col gap-1 auto-cols-min">
                    {/* Render empty cells for start day alignment */}
                    {Array.from({ length: monthData.startDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-3 h-3 md:w-4 md:h-4"></div>
                    ))}
                    
                    {/* Render days in month */}
                    {monthData.days.map((day) => (
                      <div 
                        key={day.date}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-sm relative bg-${getCellColor(day.count) === 'empty' ? 'gray-200' : 
                          getCellColor(day.count) === 'light' ? 'green-200' : 
                          getCellColor(day.count) === 'medium' ? 'green-500' : 'green-800'} 
                          hover:transform hover:scale-110 transition-transform`}
                        style={{ gridRow: day.dayOfWeek + 1 }}
                      >
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 hover:opacity-100 pointer-events-none whitespace-nowrap z-20 w-auto">
                          <div className="font-medium">
                            {new Date(day.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="text-xs opacity-90">
                            {day.count} {day.count === 1 ? 'contribution' : 'contributions'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-center mb-8 pt-2 gap-2">
            <span className="text-xs text-gray-500">Less</span>
            <div className="flex gap-1 mx-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-200 rounded-sm"></div>
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-200 rounded-sm"></div>
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-sm"></div>
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-800 rounded-sm"></div>
            </div>
            <span className="text-xs text-gray-500">More</span>
          </div>
          
          <div className="border-t border-gray-200 pt-6 flex flex-wrap gap-6 mt-4">
            <div className="flex-grow lg:flex-1 min-w-48">
              <span className="text-sm text-gray-500 mr-2">Total Contributions:</span>
              <span className="text-sm font-medium text-gray-800">
                {totalContributions}
              </span>
            </div>
            <div className="flex-grow lg:flex-1 min-w-48">
              <span className="text-sm text-gray-500 mr-2">Current Streak:</span>
              <span className="text-sm font-medium text-gray-800">
                {currentStreak} days
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-5 mb-8 font-sans">
      <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto">
        <button 
          className={`px-3 md:px-5 py-3 text-sm whitespace-nowrap cursor-pointer transition-colors border-b-2 ${
            activeTab === 'weekly' 
              ? 'border-teal-500 text-gray-800 font-medium' 
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly Activity
        </button>
        <button 
          className={`px-3 md:px-5 py-3 text-sm whitespace-nowrap cursor-pointer transition-colors border-b-2 ${
            activeTab === 'yearly' 
              ? 'border-teal-500 text-gray-800 font-medium' 
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('yearly')}
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

// TypeScript interface equivalent for reference:
// interface UserStatsProps {
//   user?: {
//     token: string;
//     [key: string]: any;
//   };
// }

export default UserStats;