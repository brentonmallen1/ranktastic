
#!/bin/sh

# Check if database exists
if [ ! -f "/app/data/database.db" ]; then
    echo "Initializing database..."
    # Initialize the database structure
    node -e "
    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const path = require('path');

    async function initDb() {
        const db = await open({
            filename: '/app/data/database.db',
            driver: sqlite3.Database
        });

        // Create polls table
        await db.exec(\`
            CREATE TABLE IF NOT EXISTS polls (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                options TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                expiresAt TEXT,
                isOpen INTEGER NOT NULL DEFAULT 1
            )
        \`);

        // Create votes table
        await db.exec(\`
            CREATE TABLE IF NOT EXISTS votes (
                id TEXT PRIMARY KEY,
                pollId TEXT NOT NULL,
                voterName TEXT NOT NULL,
                voterEmail TEXT,
                rankings TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                FOREIGN KEY (pollId) REFERENCES polls(id)
            )
        \`);

        console.log('Database initialized successfully');
        await db.close();
    }

    initDb().catch(err => {
        console.error('Error initializing database:', err);
        process.exit(1);
    });
    "
    echo "Database initialization completed."
else
    echo "Database already exists, skipping initialization."
fi

# Create health check endpoint to ensure API is properly set up
echo "Adding health check endpoint..."
mkdir -p /app/routes
cat > /app/health-check.js << 'EOF'
// Simple health check endpoint
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
EOF

# Print environment variables for debugging
echo "========== Environment Variables =========="
env
echo "=========================================="

echo "Starting server..."
exec node /app/server.js
