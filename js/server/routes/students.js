// Student Routes - full CRUD with search filter pagination
const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Student = require('../models/Student');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { rollNumber: { $regex: req.query.search, $options: 'i' } },
        { class: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.class) filter.class = req.query.class;
    if (req.query.status) filter.status = req.query.status;

    const [students, total] = await Promise.all([
      Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Student.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: students,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('rollNumber').notEmpty().withMessage('Roll number is required'),
    body('class').notEmpty().withMessage('Class is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const existing = await Student.findOne({ rollNumber: req.body.rollNumber });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Roll number already exists' });
      }

      const student = await Student.create({ ...req.body, createdBy: req.user._id });
      res.status(201).json({ success: true, data: student, message: 'Student added successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student, message: 'Student updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    await Task.deleteMany({ assignedTo: req.params.id });
    res.json({ success: true, message: 'Student and related tasks deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.id })
      .populate('assignedTo', 'name rollNumber class')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;