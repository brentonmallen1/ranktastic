
# RankChoice: Self-Hosted Ranked Choice Voting App

A simple, elegant ranked choice voting application that can be self-hosted using Docker.

## Features

- Create ranked choice polls with multiple options
- Share polls via unique links
- Vote by ranking options in order of preference
- View detailed voting results and statistics
- No login required - voters identify with name/email
- Optional poll expiration
- Self-hostable with Docker
- **SQLite database storage** for persistent, shared data

## Self-Hosting Instructions

### Using Docker Compose (Recommended)

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/rankchoice.git
   cd rankchoice
   ```

2. Start the application:
   ```
   docker-compose up -d
   ```

3. Access the application at `http://localhost:8080`

### Using Docker Directly

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/rankchoice.git
   cd rankchoice
   ```

2. Build the Docker image:
   ```
   docker build -t rankchoice .
   ```

3. Run the container:
   ```
   docker run -d -p 8080:80 --name rankchoice rankchoice
   ```

4. Access the application at `http://localhost:8080`

## Development Setup

If you want to run the application locally for development:

1. Install dependencies:
   ```
   npm install
   cd server
   npm install
   cd ..
   ```

2. Start the backend server:
   ```
   cd server
   npm run dev
   ```

3. In a separate terminal, start the frontend development server:
   ```
   npm run dev
   ```

4. Access the application at the URL shown in your terminal (usually http://localhost:5173)

## Data Storage

The application uses SQLite for data storage. All poll data is stored in a SQLite database file (`rankchoice.db`) located in the server's `data` directory. This provides:

- Persistent storage between application restarts
- Shared data access for all users
- No external database dependencies
- Simple backup and migration (just copy the .db file)

For production environments, consider setting up regular backups of the database file.

## License

Open source under the MIT License.
