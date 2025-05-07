
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import activityTracker from '../utils/activityTracker'; // Import the activity tracker

const UserStats = ({ user }) => {
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [yearlyPosts, setYearlyPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');
  const [statsError, setStatsError] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [yearlyLoading, setYearlyLoading] = useState(true);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    startDate: null,
    lastContributionDate: null
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [publishingAnimation, setPublishingAnimation] = useState(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Format the last updated timestamp
  const formatLastUpdated = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds difference
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Fetch user data from auth storage or context
  const fetchUserData = useCallback(async () => {
    const storedUser = user || JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser || !storedUser.token) {
      setStatsError("User authentication required");
      setWeeklyLoading(false);
      setYearlyLoading(false);
      return null;
    }
    return storedUser;
  }, [user]);

  // Fetch statistics data
  const fetchUserStats = useCallback(async () => {
    try {
      setWeeklyLoading(true);
      setYearlyLoading(true);
      setStatsError(null);

      const userData = await fetchUserData();
      if (!userData) return;

      const [weeklyResponse, yearlyResponse, streakResponse] = await Promise.all([
        fetch('http://localhost:5000/api/stats/weekly-activity', {
          headers: { 'Authorization': `Bearer ${userData.token}` }
        }),
        fetch('http://localhost:5000/api/stats/yearly-posts', {
          headers: { 'Authorization': `Bearer ${userData.token}` }
        }),
        fetch('http://localhost:5000/api/stats/summary', {
          headers: { 'Authorization': `Bearer ${userData.token}` }
        })
      ]);

      if (!weeklyResponse.ok || !yearlyResponse.ok || !streakResponse.ok) {
        throw new Error('Failed to fetch user activity data');
      }

      const [weeklyData, yearlyData, summaryData] = await Promise.all([
        weeklyResponse.json(),
        yearlyResponse.json(),
        streakResponse.json()
      ]);

      // Process weekly data directly from API response
      setWeeklyActivity(weeklyData);
      localStorage.setItem('userWeeklyActivity', JSON.stringify(weeklyData));

      // Process yearly data
      const formattedYearlyData = yearlyData.map(item => ({
        date: item.date,
        count: item.count || 0
      }));
      setYearlyPosts(formattedYearlyData);
      localStorage.setItem('userYearlyContributions', JSON.stringify(formattedYearlyData));

      // Set streak data from summary
      const streakData = {
        currentStreak: summaryData.currentStreak || 0,
        longestStreak: summaryData.longestStreak || 0,
        startDate: calculateStreakStartDate(summaryData.currentStreak, yearlyData),
        lastContributionDate: summaryData.mostActiveDay || null
      };
      setStreakData(streakData);
      localStorage.setItem('userStreakData', JSON.stringify(streakData));

      // Set last updated timestamp
      setLastUpdated(new Date());
      localStorage.setItem('statsLastUpdated', new Date().toISOString());

    } catch (error) {
      console.error("Error fetching statistics:", error);
      setStatsError(error.message);
      loadCachedData();
    } finally {
      setWeeklyLoading(false);
      setYearlyLoading(false);
    }
  }, [fetchUserData]);
  
  // Calculate streak start date
  const calculateStreakStartDate = (currentStreak, yearlyData) => {
    if (!currentStreak || currentStreak <= 0 || !Array.isArray(yearlyData)) return null;
    
    // Sort by date in descending order
    const sortedData = [...yearlyData].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Find consecutive days with contributions
    let streakCount = 0;
    let startDate = null;
    
    for (let i = 0; i < sortedData.length; i++) {
      if (sortedData[i].count > 0) {
        streakCount++;
        if (streakCount === currentStreak) {
          startDate = sortedData[i].date;
          break;
        }
      } else {
        break; // Streak broken
      }
    }
    
    return startDate;
  };

  // Handle article publish event
  useEffect(() => {
    const handlePublishEvent = () => {
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      
      // Set the publishing animation state
      setPublishingAnimation(today);
      
      // Update the yearly posts data to increment today's count
      setYearlyPosts(prev => {
        const newData = [...prev];
        const todayIndex = newData.findIndex(item => item.date === today);
        
        if (todayIndex !== -1) {
          // Update existing date
          newData[todayIndex] = {
            ...newData[todayIndex],
            count: (newData[todayIndex].count || 0) + 1
          };
        } else {
          // Add new date entry
          newData.push({
            date: today,
            count: 1
          });
        }
        
        // Update localStorage cache
        localStorage.setItem('userYearlyContributions', JSON.stringify(newData));
        return newData;
      });
      
      // Update the streak data
      setStreakData(prev => {
        const newStreakData = {
          ...prev,
          currentStreak: prev.currentStreak + 1,
          longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
          lastContributionDate: today
        };
        
        localStorage.setItem('userStreakData', JSON.stringify(newStreakData));
        return newStreakData;
      });
      
      // Reset the animation state after 2 seconds
      setTimeout(() => {
        setPublishingAnimation(null);
      }, 2000);
    };
    
    // Listen for the article published event
    window.addEventListener('articlePublished', handlePublishEvent);
    
    return () => {
      window.removeEventListener('articlePublished', handlePublishEvent);
    };
  }, []);

  // Initialize activity tracking
  useEffect(() => {
    const setupActivityTracking = async () => {
      const userData = await fetchUserData();
      if (userData && userData.token) {
        activityTracker.init(userData.token);
        
        // Set appropriate activity type based on the current view
        if (activeTab === 'weekly') {
          activityTracker.setActivityType('browsing');
        } else if (activeTab === 'yearly') {
          activityTracker.setActivityType('reading');
        }
      }
    };
    
    // Handle authentication errors from activity tracker
    const handleAuthError = () => {
      setStatsError('Session expired. Please refresh the page or sign in again.');
      fetchUserStats(); // Attempt to refresh data
    };
    
    window.addEventListener('activity-tracker-auth-error', handleAuthError);
    setupActivityTracking();
    
    return () => {
      window.removeEventListener('activity-tracker-auth-error', handleAuthError);
      activityTracker.cleanup();
    };
  }, [fetchUserData, activeTab, fetchUserStats]);

  // Set up data fetching and refresh intervals
  useEffect(() => {
    fetchUserStats();
    
    // Load last updated time from storage
    const savedLastUpdated = localStorage.getItem('statsLastUpdated');
    if (savedLastUpdated) {
      setLastUpdated(new Date(savedLastUpdated));
    }

    // Set up a refresh interval (refresh every 2 minutes when visible)
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUserStats();
      }
    }, 2 * 60 * 1000);

    // Set up visibility change handler for real-time updates
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh data when tab becomes visible after being hidden
        fetchUserStats();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUserStats]);

  // Load cached data from localStorage if API calls fail
  const loadCachedData = () => {
    try {
      const cachedWeekly = localStorage.getItem('userWeeklyActivity');
      const cachedYearly = localStorage.getItem('userYearlyContributions');
      const cachedStreaks = localStorage.getItem('userStreakData');
      const cachedLastUpdated = localStorage.getItem('statsLastUpdated');
      
      if (cachedWeekly) setWeeklyActivity(JSON.parse(cachedWeekly));
      else generateMockWeeklyData();
      
      if (cachedYearly) setYearlyPosts(JSON.parse(cachedYearly));
      else generateMockYearlyData();
      
      if (cachedStreaks) setStreakData(JSON.parse(cachedStreaks));
      else generateMockStreakData();
      
      if (cachedLastUpdated) setLastUpdated(new Date(cachedLastUpdated));
    } catch (error) {
      console.error("Error loading cached data:", error);
      generateMockWeeklyData();
      generateMockYearlyData();
      generateMockStreakData();
    }
  };

  // Generate mock weekly data as fallback
  const generateMockWeeklyData = () => {
    const mockWeeklyData = daysOfWeek.map(day => ({
      day,
      hours: parseFloat((Math.random() * 5 + 0.5).toFixed(1))
    }));
    setWeeklyActivity(mockWeeklyData);
  };

  // Generate mock yearly data as fallback
  const generateMockYearlyData = () => {
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

    setYearlyPosts(mockYearlyData);
  };
  
  // Generate mock streak data as fallback
  const generateMockStreakData = () => {
    const today = new Date();
    const mockStreakData = {
      currentStreak: Math.floor(Math.random() * 10) + 1,
      longestStreak: Math.floor(Math.random() * 30) + 10,
      startDate: new Date(today.setDate(today.getDate() - Math.floor(Math.random() * 10))).toISOString().split('T')[0],
      lastContributionDate: new Date().toISOString().split('T')[0]
    };
    setStreakData(mockStreakData);
    localStorage.setItem('userStreakData', JSON.stringify(mockStreakData));
  };

  // Determine color intensity based on count and publishing status
  const getCellColor = (count, date) => {
    // If this is the cell that's publishing, apply special class
    if (publishingAnimation && date === publishingAnimation) {
      return 'bg-green-500 animate-publish-pulse';
    }
    
    if (count === 0) return 'bg-gray-200';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-500';
    return 'bg-green-800';
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
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const days = [];
      const monthStart = new Date(year, month, 1);
      const startDayOfWeek = monthStart.getDay();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date > endDate) break;
        if (date < startDate) continue;
        
        const dateStr = date.toISOString().split('T')[0];
        days.push({
          date: dateStr,
          count: postsMap[dateStr] || 0,
          dayOfWeek: date.getDay(),
          fullDate: date
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
      
      currentDate = new Date(year, month + 1, 1);
    }
    
    return monthsData;
  };

  // Format a date for hover display
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Format a date for streak display
  const formatStreakDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Handle tab changes with activity tracking update
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update activity type based on the selected tab
    if (activityTracker.isTracking) {
      activityTracker.setActivityType(tab === 'weekly' ? 'browsing' : 'reading');
    }
  };

  // Manually refresh data
  const handleRefresh = () => {
    fetchUserStats();
  };

  // Memoize expensive calculations
  const monthsData = useMemo(() => organizePostsByMonth(), [yearlyPosts]);
  const weeklyMax = useMemo(() => Math.max(...weeklyActivity.map(day => day.hours || 0), 1), [weeklyActivity]);
  const totalContributions = useMemo(() => yearlyPosts.reduce((sum, day) => sum + (day.count || 0), 0), [yearlyPosts]);
  const averageDailyActivity = useMemo(() => {
    const totalHours = weeklyActivity.reduce((sum, day) => sum + (day.hours || 0), 0);
    return (totalHours / Math.max(weeklyActivity.length, 1)).toFixed(1);
  }, [weeklyActivity]);
  const mostActiveDay = useMemo(() => {
    if (weeklyActivity.length === 0) return 'N/A';
    return [...weeklyActivity].sort((a, b) => b.hours - a.hours)[0]?.day || 'N/A';
  }, [weeklyActivity]);

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
        onClick={loadCachedData} 
        className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700"
      >
        Load Cached Data
      </button>
    </div>
  );

  const renderWeeklyPanel = () => (
    <div className={`${activeTab === 'weekly' ? 'block' : 'hidden'} animate-fadeIn`}>
      <h3 className="text-lg font-medium mb-6 text-gray-800">Time Active (Last 7 Days)</h3>
      {weeklyLoading ? renderLoading() : (
        <>
          <div className="flex justify-between items-end h-40 md:h-48 mb-6 gap-1">
            {weeklyActivity.map((day, index) => {
              const hours = Math.floor(day.hours);
              const minutes = Math.round((day.hours % 1) * 60);
              const timeString = hours > 0 ? 
                `${hours}h ${minutes}m` : 
                minutes > 0 ? 
                  `${minutes}m` : 
                  '0m';
              
              return (
                <div className="flex flex-col items-center w-1/7" key={index}>
                  <div className="h-full w-full flex items-end justify-center relative group">
                    <div 
                      className="bg-teal-500 rounded-t w-full max-w-6 md:max-w-7 hover:bg-teal-600 transition-colors min-h-1 cursor-pointer"
                      style={{ height: `${(day.hours / weeklyMax) * 100}%` }}
                      aria-label={`${day.day}: ${timeString}`}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs py-1.5 px-3 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap">
                        <div className="font-medium">{day.day}</div>
                        <div className="text-gray-300 text-[11px]">{timeString} active</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">{day.day}</div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-200 pt-6 flex flex-wrap gap-6 mt-4">
            <div className="flex-grow lg:flex-1 min-w-48">
              <span className="text-sm text-gray-500 mr-2">Average Daily Activity:</span>
              <span className="text-sm font-medium text-gray-800">
                {(() => {
                  const avgHours = parseFloat(averageDailyActivity);
                  const hours = Math.floor(avgHours);
                  const minutes = Math.round((avgHours % 1) * 60);
                  return hours > 0 ? 
                    `${hours}h ${minutes}m` : 
                    minutes > 0 ? 
                      `${minutes}m` : 
                      '0m';
                })()} 
              </span>
            </div>
            <div className="flex-grow lg:flex-1 min-w-48">
              <span className="text-sm text-gray-500 mr-2">Most Active Day:</span>
              <span className="text-sm font-medium text-gray-800">
                {mostActiveDay}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderYearlyPanel = () => (
    <div className={`${activeTab === 'yearly' ? 'block' : 'hidden'} animate-fadeIn`}>
      <h3 className="text-lg font-medium mb-6 text-gray-800">Post Activity (Last 12 Months)</h3>
      {yearlyLoading ? renderLoading() : (
        <>
          <div className="relative pl-14 pb-8 mb-6 overflow-x-auto max-w-full">
            <div className="absolute left-0 top-0 flex flex-col justify-between h-full pt-12 pb-5 pl-2">
              {daysOfWeek.filter((_, i) => i % 2 === 0).map((day) => (
                <div key={day} className="text-xs text-gray-500 py-1 pr-1">{day}</div>
              ))}
            </div>
            
            <div className="flex items-start space-x-6 pb-2 pt-2 flex-nowrap overflow-x-auto scrollbar-thin">
              {monthsData.map((monthData, monthIndex) => (
                <div key={`${monthData.year}-${monthData.month}`} className="flex flex-col min-w-fit">
                  <div className="text-xs text-gray-500 h-6 mb-2 pl-1 font-medium">
                    {monthData.monthName}
                  </div>
                  <div className="grid grid-rows-7 grid-flow-col gap-1 auto-cols-min">
                    {Array.from({ length: monthData.startDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-3 h-3 md:w-4 md:h-4"></div>
                    ))}
                    
                    {monthData.days.map((day) => (
                      <div 
                        key={day.date}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-sm relative ${getCellColor(day.count, day.date)} 
                          hover:transform hover:scale-110 transition-transform cursor-pointer
                          ${day.date === streakData.startDate ? 'ring-2 ring-teal-600' : ''}
                          ${day.date === streakData.lastContributionDate ? 'ring-2 ring-blue-500' : ''}`}
                        style={{ gridRow: day.dayOfWeek + 1 }}
                        onMouseEnter={() => setHoverInfo({
                          date: formatDate(day.fullDate),
                          count: day.count,
                          top: (day.dayOfWeek * 22) + 40,
                          left: (monthIndex * 36) + 16,
                          isStreakDay: day.date === streakData.startDate || day.date === streakData.lastContributionDate,
                          isStartStreak: day.date === streakData.startDate,
                          isLastContribution: day.date === streakData.lastContributionDate
                        })}
                        onMouseLeave={() => setHoverInfo(null)}
                        onClick={() => {
                          if (window.history && day.count > 0) {
                            window.history.pushState({}, '', `/activity/${day.date}`);
                            window.dispatchEvent(new CustomEvent('view-activity-date', {
                              detail: { date: day.date }
                            }));
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {hoverInfo && (
              <div 
                className="absolute bg-gray-800 text-white text-xs py-2 px-3 rounded shadow-lg z-20 pointer-events-none"
                style={{ 
                  top: `${hoverInfo.top}px`,
                  left: `${hoverInfo.left}px`
                }}
              >
                <div className="font-medium whitespace-nowrap">{hoverInfo.date}</div>
                <div className="text-xs opacity-90 whitespace-nowrap">
                  {hoverInfo.count} {hoverInfo.count === 1 ? 'contribution' : 'contributions'}
                </div>
                {hoverInfo.isStreakDay && (
                  <div className={`text-xs whitespace-nowrap mt-1 ${
                    hoverInfo.isStartStreak ? 'text-teal-300' : 'text-blue-300'
                  }`}>
                    {hoverInfo.isStartStreak ? 'Current streak started' : 'Last contribution'}
                  </div>
                )}
              </div>
            )}
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
            <div className="flex-grow lg:flex-1 min-w-48 relative group">
              <span className="text-sm text-gray-500 mr-2">Current Streak:</span>
              <span className="text-sm font-medium text-gray-800">
                {streakData.currentStreak} {streakData.currentStreak === 1 ? 'day' : 'days'}
              </span>
              <div className="hidden group-hover:block absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-3 border border-gray-200 z-10 w-48">
                <div className="text-xs text-gray-600 mb-2">
                  <span className="font-medium">Started:</span> {formatStreakDate(streakData.startDate)}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  <span className="font-medium">Last Contribution:</span> {formatStreakDate(streakData.lastContributionDate)}
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Longest Streak:</span> {streakData.longestStreak} days
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-5 mb-8 font-sans relative">
      <div className="absolute top-4 right-4 flex flex-col items-end">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-400 mr-2">
            Last updated: {formatLastUpdated(lastUpdated)}
          </span>
          <button 
            onClick={handleRefresh}
            className="text-teal-500 hover:text-teal-700" 
            title="Refresh data"
            disabled={weeklyLoading || yearlyLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto">
        <button 
          className={`px-4 py-3 text-sm whitespace-nowrap cursor-pointer transition-colors border-b-2 ${
            activeTab === 'weekly' 
              ? 'border-teal-500 text-gray-800 font-medium' 
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
          }`}
          onClick={() => handleTabChange('weekly')}
        >
          Weekly Activity
        </button>
        <button 
          className={`px-4 py-3 text-sm whitespace-nowrap cursor-pointer transition-colors border-b-2 ${
            activeTab === 'yearly' 
              ? 'border-teal-500 text-gray-800 font-medium' 
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
          }`}
          onClick={() => handleTabChange('yearly')}
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

export default UserStats;