
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;

async function initializeDb() {
  db = await open({
    filename: path.join(__dirname, 'data', 'database.db'),
    driver: sqlite3.Database
  });
  console.log('Connecte to SQLite database');
}

// Initialize database connection
initializeDb().catch(console.error);

// API Routes
app.post('/api/polls', async (req, res) => {
  try {
    const { title, description, options, expiresAt, isOpen } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    const createdAt = new Date().toISOString();

    const result = await db.run(
      `INSERT INTO polls (id, title, description, options, createdAt, expiresAt, isOpen) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, JSON.stringify(options), createdAt, expiresAt, isOpen ? 1 : 0]
    );

    res.status(201).json({ id, title });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

app.get('/api/polls', async (req, res) => {
  try {
    const polls = await db.all('SELECT * FROM polls');
    res.json(polls.map(poll => ({
      ...poll,
      options: JSON.parse(poll.options),
      isOpen: Boolean(poll.isOpen)
    })));
  } catch (error) {
    console.error('Error getting polls:', error);
    res.status(500).json({ error: 'Failed to get polls' });
  }
});

app.get('/api/polls/:id', async (req, res) => {
  try {
    const poll = await db.get('SELECT * FROM polls WHERE id = ?', req.params.id);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json({
      ...poll,
      options: JSON.parse(poll.options),
      isOpen: Boolean(poll.isOpen)
    });
  } catch (error) {
    console.error('Error getting poll:', error);
    res.status(500).json({ error: 'Failed to get poll' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
