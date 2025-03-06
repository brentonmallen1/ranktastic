
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

# Check if routes directory exists and output for debugging
echo "Checking for routes directory..."
if [ -d "/app/routes" ]; then
    echo "Routes directory exists at /app/routes"
    ls -la /app/routes
else
    echo "Routes directory NOT found at /app/routes!"
    echo "Current directory structure:"
    find /app -type d | sort
fi

# Print server.js content for debugging
echo "====== SERVER.JS CONTENT ======"
cat /app/server.js
echo "=============================="

# Make sure server is configured to handle API routes properly
echo "========== Environment Variables =========="
env
echo "=========================================="

echo "Starting server with proper API route handling..."
exec node server.js
