const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Entertainment = require('./models/Entertainment');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'))); // just in case if we use public
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
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
