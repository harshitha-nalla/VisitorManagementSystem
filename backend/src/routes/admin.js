const express = require('express');
const router = express.Router();
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

// Get all employees
router.get('/employees', adminAuth, async (req, res) => {
  try {
    const employees = await User.find({}, { password: 0 }); // Exclude password field
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new employee
router.post('/employees', adminAuth, async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      department,
      role: role || 'employee'
    });

    await user.save();

    // Return user without password
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update employee
router.patch('/employees/:id', adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // If updating email, check if new email already exists
    if (updates.email && updates.email !== employee.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    // Update fields
    Object.keys(updates).forEach(update => {
      employee[update] = updates[update];
    });

    await employee.save();

    // Return updated user without password
    const userWithoutPassword = { ...employee.toObject() };
    delete userWithoutPassword.password;

    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete employee
router.delete('/employees/:id', adminAuth, async (req, res) => {
  try {
    const employee = await User.findOneAndDelete({email:req.params.id});
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 