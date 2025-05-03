// routes/stats.js - Router for user statistics endpoints
import express from 'express';
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import { authenticateUser } from '../middleware/auth.js';
import UserActivity from '../models/UserActivity.js';

const router = express.Router();

// GET weekly activity (time spent on site per day of week)
router.get('/weekly-activity', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activityData = await UserActivity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          hours: { $sum: { $divide: ["$duration", 60] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const formattedData = [];
    const activityMap = {};

    activityData.forEach(item => {
      activityMap[item._id] = item.hours;
    });

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = daysOfWeek[date.getDay()];

      formattedData.unshift({
        day: dayOfWeek,
        hours: parseFloat((activityMap[dateStr] || 0).toFixed(1))
      });
    }

    res.json(formattedData);
  } catch (err) {
    console.error('Error fetching weekly activity:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET yearly post activity
router.get('/yearly-posts', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const postData = await Blog.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedData = [];
    const postMap = {};
    postData.forEach(item => {
      postMap[item._id] = item.count;
    });

    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      formattedData.push({
        date: dateStr,
        count: postMap[dateStr] || 0
      });
    }

    res.json(formattedData);
  } catch (err) {
    console.error('Error fetching yearly posts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET stats summary
router.get('/summary', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const totalPosts = await Blog.countDocuments({ author: userId });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activityByDay = await UserActivity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalMinutes: { $sum: "$duration" }
        }
      },
      { $sort: { totalMinutes: -1 } },
      { $limit: 1 }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyActivity = await UserActivity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: "$duration" }
        }
      }
    ]);

    const avgDailyMinutes = weeklyActivity.length > 0 ?
      (weeklyActivity[0].totalMinutes / 7) : 0;

    const allUserPosts = await Blog.find({ author: userId }).sort({ createdAt: -1 });
    let currentStreak = 0;
    let lastDate = null;

    if (allUserPosts.length > 0) {
      lastDate = new Date(allUserPosts[0].createdAt);
      lastDate.setHours(0, 0, 0, 0);
      currentStreak = 1;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (lastDate.getTime() !== today.getTime()) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (lastDate.getTime() !== yesterday.getTime()) {
          currentStreak = 0;
        }
      }

      const postsByDay = {};
      allUserPosts.forEach(post => {
        const dateKey = new Date(post.createdAt).toISOString().split('T')[0];
        postsByDay[dateKey] = true;
      });

      let checkDate = new Date(lastDate);
      if (currentStreak > 0) {
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const dateKey = checkDate.toISOString().split('T')[0];
          if (postsByDay[dateKey]) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      totalPosts,
      mostActiveDay: activityByDay.length > 0 ? activityByDay[0]._id : null,
      mostActiveTime: activityByDay.length > 0 ? (activityByDay[0].totalMinutes / 60).toFixed(1) + ' hours' : '0 hours',
      avgDailyActivity: (avgDailyMinutes / 60).toFixed(1) + ' hours',
      currentStreak
    });
  } catch (err) {
    console.error('Error fetching stats summary:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST track activity
router.post('/track-activity', authenticateUser, async (req, res) => {
  try {
    const { sessionStart, sessionEnd, activityType } = req.body;
    const userId = req.user.id;

    const start = new Date(sessionStart);
    const end = new Date(sessionEnd);
    const durationMinutes = Math.round((end - start) / (1000 * 60));

    if (durationMinutes < 1) {
      return res.status(400).json({ message: 'Session too short to record' });
    }

    if (durationMinutes > 720) {
      return res.status(400).json({ message: 'Session duration too long' });
    }

    const activity = new UserActivity({
      userId,
      date: start,
      sessionStart: start,
      sessionEnd: end,
      duration: durationMinutes,
      activityType: activityType || 'browsing'
    });

    await activity.save();

    res.status(201).json({
      message: 'Activity tracked successfully',
      duration: durationMinutes
    });
  } catch (err) {
    console.error('Error tracking activity:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
