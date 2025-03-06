
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
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Access the application at `http://localhost:8080`

## Data Storage

The application uses IndexedDB (client-side storage) wrapped to function similarly to SQLite. All poll data is stored in the browser. For self-hosted instances with multiple users, the polls created by each user will only be accessible on their own device.

## License

Open source under the MIT License.
