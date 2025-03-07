
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

# Print environment variables for debugging
echo "========== Environment Variables =========="
env
echo "=========================================="

# Verify directory structure
echo "========== Directory Structure =========="
ls -la /app
ls -la /app/data || mkdir -p /app/data && chmod 777 /app/data
echo "=========================================="

# Ensure we have direct access to data directory
echo "Data directory status: $(ls -la /app/data || echo 'Not found')"

# Check if index.js exists
if [ ! -f "/app/index.js" ]; then
    echo "ERROR: index.js not found!"
    ls -la /app
    exit 1
fi

# Make sure we're using the correct server file
echo "Using server file: /app/index.js"

# Print first few lines of index.js for debugging
echo "First 20 lines of index.js:"
head -n 20 /app/index.js

# Start the server directly with node
echo "Starting server with index.js..."
exec node /app/index.js
