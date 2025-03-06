
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const router = express.Router();
let db;

// Initialize SQLite DB connection
const initDb = async () => {
  if (!db) {
    db = await open({
      filename: '/app/data/database.db',
      driver: sqlite3.Database
    });
    console.log('Connected to SQLite database');
  }
  return db;
};

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    await initDb();
    res.json({ status: 'ok', message: 'SQLite database is connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Root endpoint
router.get('/', (req, res) => {
  res.json({ message: 'RankChoice API is running' });
});

// Get all polls
router.get('/polls', async (req, res) => {
  try {
    const db = await initDb();
    
    const polls = await db.all('SELECT * FROM polls');
    
    // Parse options from JSON string to array
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
router.get('/polls/:id', async (req, res) => {
  try {
    const db = await initDb();
    
    const poll = await db.get('SELECT * FROM polls WHERE id = ?', req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    // Parse options from JSON string to array
    poll.options = JSON.parse(poll.options);
    
    res.json(poll);
  } catch (error) {
    console.error('Error getting poll:', error);
    res.status(500).json({ error: 'Failed to get poll' });
  }
});

// Create a new poll
router.post('/polls', async (req, res) => {
  try {
    const db = await initDb();
    
    const { title, description, options, expiresAt } = req.body;
    
    // Validate required fields
    if (!title || !options || !Array.isArray(options)) {
      return res.status(400).json({ error: 'Title and options array are required' });
    }
    
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Convert options array to JSON string for storage
    const optionsJson = JSON.stringify(options);
    
    await db.run(
      `INSERT INTO polls (id, title, description, options, createdAt, expiresAt, isOpen) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        description || '',
        optionsJson,
        createdAt,
        expiresAt || null,
        1 // isOpen (1 = true)
      ]
    );
    
    res.status(201).json({ id });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Update a poll
router.put('/polls/:id', async (req, res) => {
  try {
    const db = await initDb();
    
    const { title, description, options, expiresAt, isOpen } = req.body;
    const { id } = req.params;
    
    // Check if poll exists
    const existingPoll = await db.get('SELECT * FROM polls WHERE id = ?', id);
    if (!existingPoll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    // Convert options array to JSON string if provided
    const optionsJson = options ? JSON.stringify(options) : existingPoll.options;
    
    await db.run(
      `UPDATE polls 
       SET title = ?, description = ?, options = ?, expiresAt = ?, isOpen = ? 
       WHERE id = ?`,
      [
        title || existingPoll.title,
        description !== undefined ? description : existingPoll.description,
        optionsJson,
        expiresAt !== undefined ? expiresAt : existingPoll.expiresAt,
        isOpen !== undefined ? (isOpen ? 1 : 0) : existingPoll.isOpen,
        id
      ]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating poll:', error);
    res.status(500).json({ error: 'Failed to update poll' });
  }
});

// Close a poll
router.put('/polls/:id/close', async (req, res) => {
  try {
    const db = await initDb();
    
    const { id } = req.params;
    
    // Check if poll exists
    const existingPoll = await db.get('SELECT * FROM polls WHERE id = ?', id);
    if (!existingPoll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    await db.run('UPDATE polls SET isOpen = 0 WHERE id = ?', id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error closing poll:', error);
    res.status(500).json({ error: 'Failed to close poll' });
  }
});

// Delete a poll
router.delete('/polls/:id', async (req, res) => {
  try {
    const db = await initDb();
    
    const { id } = req.params;
    
    // Check if poll exists
    const existingPoll = await db.get('SELECT * FROM polls WHERE id = ?', id);
    if (!existingPoll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    // Delete poll and its votes
    await db.run('DELETE FROM votes WHERE pollId = ?', id);
    await db.run('DELETE FROM polls WHERE id = ?', id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ error: 'Failed to delete poll' });
  }
});

// Get votes for a poll
router.get('/polls/:id/votes', async (req, res) => {
  try {
    const db = await initDb();
    
    const { id } = req.params;
    
    // Check if poll exists
    const existingPoll = await db.get('SELECT * FROM polls WHERE id = ?', id);
    if (!existingPoll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    const votes = await db.all('SELECT * FROM votes WHERE pollId = ?', id);
    
    // Parse rankings from JSON string to array
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

// Check if a voter has already voted
router.get('/polls/:id/hasVoted', async (req, res) => {
  try {
    const db = await initDb();
    
    const { id } = req.params;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
    
    // Check if poll exists
    const existingPoll = await db.get('SELECT * FROM polls WHERE id = ?', id);
    if (!existingPoll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    const vote = await db.get(
      'SELECT * FROM votes WHERE pollId = ? AND voterEmail = ?',
      [id, email]
    );
    
    res.json({ hasVoted: !!vote });
  } catch (error) {
    console.error('Error checking if voter has voted:', error);
    res.status(500).json({ error: 'Failed to check if voter has voted' });
  }
});

// Submit a vote
router.post('/votes', async (req, res) => {
  try {
    const db = await initDb();
    
    const { pollId, voterName, voterEmail, rankings } = req.body;
    
    // Validate required fields
    if (!pollId || !voterName || !rankings || !Array.isArray(rankings)) {
      return res.status(400).json({ error: 'PollId, voterName, and rankings array are required' });
    }
    
    // Check if poll exists and is open
    const poll = await db.get('SELECT * FROM polls WHERE id = ? AND isOpen = 1', pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found or is closed' });
    }
    
    // Check if voter has already voted
    if (voterEmail) {
      const existingVote = await db.get(
        'SELECT * FROM votes WHERE pollId = ? AND voterEmail = ?',
        [pollId, voterEmail]
      );
      
      if (existingVote) {
        return res.status(400).json({ error: 'You have already submitted a vote for this poll' });
      }
    }
    
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Convert rankings array to JSON string for storage
    const rankingsJson = JSON.stringify(rankings);
    
    await db.run(
      `INSERT INTO votes (id, pollId, voterName, voterEmail, rankings, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        pollId,
        voterName,
        voterEmail || null,
        rankingsJson,
        createdAt
      ]
    );
    
    res.status(201).json({ id });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

module.exports = router;
