const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;

async function initializeDatabase() {
  // Open database in the data directory
  db = await open({
    filename: path.join(__dirname, 'data', 'rankchoice.db'),
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS polls (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      options TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      expiresAt TEXT,
      isOpen INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      pollId TEXT NOT NULL,
      voterName TEXT NOT NULL,
      voterEmail TEXT,
      rankings TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (pollId) REFERENCES polls (id)
    );
  `);

  console.log('Database initialized successfully');
}

// Initialize database when server starts
initializeDatabase().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// API Routes

// Get all polls
app.get('/api/polls', async (req, res) => {
  try {
    const polls = await db.all('SELECT * FROM polls ORDER BY createdAt DESC');
    
    // Parse JSON string fields
    const parsedPolls = polls.map(poll => ({
      ...poll,
      options: JSON.parse(poll.options),
      isOpen: Boolean(poll.isOpen)
    }));
    
    res.json(parsedPolls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// Get a single poll
app.get('/api/polls/:id', async (req, res) => {
  try {
    const poll = await db.get('SELECT * FROM polls WHERE id = ?', req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    // Parse JSON string fields
    const parsedPoll = {
      ...poll,
      options: JSON.parse(poll.options),
      isOpen: Boolean(poll.isOpen)
    };
    
    res.json(parsedPoll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

// Create a new poll
app.post('/api/polls', async (req, res) => {
  try {
    const { title, description, options, expiresAt, isOpen } = req.body;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    // Store options as JSON string
    const optionsJSON = JSON.stringify(options);
    
    await db.run(
      'INSERT INTO polls (id, title, description, options, createdAt, expiresAt, isOpen) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, optionsJSON, createdAt, expiresAt, isOpen ? 1 : 0]
    );
    
    res.status(201).json({ id });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Update a poll
app.put('/api/polls/:id', async (req, res) => {
  try {
    const { title, description, options, expiresAt, isOpen } = req.body;
    const { id } = req.params;
    
    // Store options as JSON string
    const optionsJSON = JSON.stringify(options);
    
    await db.run(
      'UPDATE polls SET title = ?, description = ?, options = ?, expiresAt = ?, isOpen = ? WHERE id = ?',
      [title, description, optionsJSON, expiresAt, isOpen ? 1 : 0, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating poll:', error);
    res.status(500).json({ error: 'Failed to update poll' });
  }
});

// Delete a poll
app.delete('/api/polls/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM polls WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ error: 'Failed to delete poll' });
  }
});

// Close a poll
app.put('/api/polls/:id/close', async (req, res) => {
  try {
    await db.run('UPDATE polls SET isOpen = 0 WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error closing poll:', error);
    res.status(500).json({ error: 'Failed to close poll' });
  }
});

// Submit a vote
app.post('/api/votes', async (req, res) => {
  try {
    const { pollId, voterName, voterEmail, rankings } = req.body;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    // Store rankings as JSON string
    const rankingsJSON = JSON.stringify(rankings);
    
    await db.run(
      'INSERT INTO votes (id, pollId, voterName, voterEmail, rankings, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, pollId, voterName, voterEmail, rankingsJSON, createdAt]
    );
    
    res.status(201).json({ id });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// Get votes for a poll
app.get('/api/polls/:id/votes', async (req, res) => {
  try {
    const votes = await db.all('SELECT * FROM votes WHERE pollId = ?', req.params.id);
    
    // Parse JSON string fields
    const parsedVotes = votes.map(vote => ({
      ...vote,
      rankings: JSON.parse(vote.rankings)
    }));
    
    res.json(parsedVotes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

// Check if a user has voted
app.get('/api/polls/:id/hasVoted', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
    
    const vote = await db.get(
      'SELECT * FROM votes WHERE pollId = ? AND voterEmail = ?',
      [req.params.id, email]
    );
    
    res.json({ hasVoted: Boolean(vote) });
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({ error: 'Failed to check vote status' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
