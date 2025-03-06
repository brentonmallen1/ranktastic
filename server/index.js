
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Setup CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Database connection
let db;
const initDb = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, 'data', 'database.db'),
      driver: sqlite3.Database
    });
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Basic root endpoint for checking if API is running
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Rank Choice Server API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
// Get all polls
app.get('/polls', async (req, res) => {
  try {
    const polls = await db.all('SELECT * FROM polls');
    
    // Convert options from JSON string to array
    const formattedPolls = polls.map(poll => ({
      ...poll,
      options: JSON.parse(poll.options)
    }));
    
    res.json(formattedPolls);
  } catch (error) {
    console.error('Error getting polls:', error);
    res.status(500).json({ error: 'Failed to get polls' });
  }
});

// Get a specific poll
app.get('/polls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await db.get('SELECT * FROM polls WHERE id = ?', [id]);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    // Convert options from JSON string to array
    poll.options = JSON.parse(poll.options);
    
    res.json(poll);
  } catch (error) {
    console.error('Error getting poll:', error);
    res.status(500).json({ error: 'Failed to get poll' });
  }
});

// Create a new poll
app.post('/polls', async (req, res) => {
  try {
    const { title, description, options, expiresAt, isOpen } = req.body;
    
    if (!title || !options || !Array.isArray(options)) {
      return res.status(400).json({ error: 'Invalid poll data' });
    }
    
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Convert options array to JSON string
    const optionsJson = JSON.stringify(options);
    
    await db.run(
      `INSERT INTO polls (id, title, description, options, createdAt, expiresAt, isOpen) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description || '', optionsJson, createdAt, expiresAt, isOpen ? 1 : 0]
    );
    
    res.status(201).json({ id, title });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Update a poll
app.put('/polls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, options, expiresAt, isOpen } = req.body;
    
    const poll = await db.get('SELECT * FROM polls WHERE id = ?', [id]);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    // Convert options array to JSON string
    const optionsJson = Array.isArray(options) ? JSON.stringify(options) : poll.options;
    
    await db.run(
      `UPDATE polls SET 
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       options = COALESCE(?, options),
       expiresAt = COALESCE(?, expiresAt),
       isOpen = COALESCE(?, isOpen)
       WHERE id = ?`,
      [title, description, optionsJson, expiresAt, isOpen !== undefined ? (isOpen ? 1 : 0) : poll.isOpen, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating poll:', error);
    res.status(500).json({ error: 'Failed to update poll' });
  }
});

// Close a poll
app.put('/polls/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    
    const poll = await db.get('SELECT * FROM polls WHERE id = ?', [id]);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    await db.run('UPDATE polls SET isOpen = 0 WHERE id = ?', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error closing poll:', error);
    res.status(500).json({ error: 'Failed to close poll' });
  }
});

// Delete a poll
app.delete('/polls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const poll = await db.get('SELECT * FROM polls WHERE id = ?', [id]);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    await db.run('DELETE FROM polls WHERE id = ?', [id]);
    await db.run('DELETE FROM votes WHERE pollId = ?', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ error: 'Failed to delete poll' });
  }
});

// Get votes for a poll
app.get('/polls/:id/votes', async (req, res) => {
  try {
    const { id } = req.params;
    
    const poll = await db.get('SELECT * FROM polls WHERE id = ?', [id]);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    const votes = await db.all('SELECT * FROM votes WHERE pollId = ?', [id]);
    
    // Convert rankings from JSON string to array
    const formattedVotes = votes.map(vote => ({
      ...vote,
      rankings: JSON.parse(vote.rankings)
    }));
    
    res.json(formattedVotes);
  } catch (error) {
    console.error('Error getting votes:', error);
    res.status(500).json({ error: 'Failed to get votes' });
  }
});

// Check if user has voted
app.get('/polls/:id/hasVoted', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const vote = await db.get(
      'SELECT * FROM votes WHERE pollId = ? AND voterEmail = ?',
      [id, email]
    );
    
    res.json({ hasVoted: !!vote });
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({ error: 'Failed to check vote status' });
  }
});

// Submit a vote
app.post('/votes', async (req, res) => {
  try {
    const { pollId, voterName, voterEmail, rankings } = req.body;
    
    if (!pollId || !voterName || !rankings || !Array.isArray(rankings)) {
      return res.status(400).json({ error: 'Invalid vote data' });
    }
    
    const poll = await db.get('SELECT * FROM polls WHERE id = ?', [pollId]);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    if (!poll.isOpen) {
      return res.status(400).json({ error: 'Poll is closed' });
    }
    
    // Check if user has already voted
    if (voterEmail) {
      const existingVote = await db.get(
        'SELECT * FROM votes WHERE pollId = ? AND voterEmail = ?',
        [pollId, voterEmail]
      );
      
      if (existingVote) {
        return res.status(400).json({ error: 'You have already voted in this poll' });
      }
    }
    
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Convert rankings array to JSON string
    const rankingsJson = JSON.stringify(rankings);
    
    await db.run(
      `INSERT INTO votes (id, pollId, voterName, voterEmail, rankings, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, pollId, voterName, voterEmail || null, rankingsJson, createdAt]
    );
    
    res.status(201).json({ id });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// Start the server after connecting to database
const startServer = async () => {
  await initDb();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS origins: ${corsOptions.origin}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
