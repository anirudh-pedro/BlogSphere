import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  sessionStart: {
    type: Date,
    required: true
  },
  sessionEnd: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  activityType: {
    type: String,
    enum: ['writing', 'editing', 'reading', 'browsing'],
    default: 'browsing'
  }
});

userActivitySchema.index({ userId: 1, date: 1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

export default UserActivity;
