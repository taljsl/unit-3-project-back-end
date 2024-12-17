const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const Entertainment = require('./models/Entertainment');
const User = require('./models/user');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer Token
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Register Route
app.post(
  '/register',
  body('username').isString().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
      return res.send("Please make sure you add at least one capital, one special character and one number.");
    }

    try {
      const { username, password } = req.body;
      const userExists = await User.findOne({ username });
      if (userExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      const newUser = new User({ username, password });
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Login Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes go here
app.get('/', (req, res) => {
  res.send('Welcome to the Entertainment CRUD API!');
});

// Create a new entertainment entry
app.post('/entertainment', async (req, res) => {
  try {
    const entertainment = new Entertainment(req.body);
    await entertainment.save();
    res.status(201).json(entertainment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all entertainment entries
app.get('/entertainment', async (req, res) => {
  try {
    const entertainmentList = await Entertainment.find();
    res.json(entertainmentList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read a single entertainment entry by ID
app.get('/entertainment/:id', async (req, res) => {
  try {
    const entertainment = await Entertainment.findById(req.params.id);
    if (!entertainment) return res.status(404).json({ error: 'Entry not found' });
    res.json(entertainment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an entertainment entry by ID
app.put('/entertainment/:id', async (req, res) => {
  try {
    const entertainment = await Entertainment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!entertainment) return res.status(404).json({ error: 'Entry not found' });
    res.json(entertainment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an entertainment entry by ID
app.delete('/entertainment/:id', async (req, res) => {
  try {
    const entertainment = await Entertainment.findByIdAndDelete(req.params.id);
    if (!entertainment) return res.status(404).json({ error: 'Entry not found' });
    res.json({ message: 'Entry deleted successfully', entertainment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log('The express app is ready at localhost:3001!');
});
