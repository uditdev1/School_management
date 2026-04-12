// Dashboard Routes - stats and analytics aggregation
const express = require('express');
const Student = require('../models/Student');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/stats', async (req, res) => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalTasks,
      pendingTasks,
      completedTasks,
      inProgressTasks,
      recentStudents,
      recentTasks,
      overdueTasks,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'Active' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'Pending' }),
      Task.countDocuments({ status: 'Completed' }),
      Task.countDocuments({ status: 'In Progress' }),
      Student.find().sort({ createdAt: -1 }).limit(5),
      Task.find()
        .populate('assignedTo', 'name rollNumber class')
        .sort({ createdAt: -1 })
        .limit(5),
      Task.countDocuments({
        status: { $ne: 'Completed' },
        dueDate: { $lt: new Date() },
      }),
    ]);

    const classDistribution = await Student.aggregate([
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const tasksByPriority = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          activeStudents,
          totalTasks,
          pendingTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          completionRate:
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        recentStudents,
        recentTasks,
        classDistribution,
        tasksByPriority,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;