# Music Streaming Platform

A comprehensive music streaming service with features like secure streaming, playlist management, shared listening, and subscription plans.

## Features

### User Features
- Secure music streaming with variable quality options
- Free tier (with ads) and premium subscription models
- Personal playlist creation and management
- Liked/favorite music collection
- Genre, artist, album browsing and discovery
- Personalized music recommendations
- Shared listening sessions (synchronized playback)
- User profile management
- Search functionality

### Admin Features
- Music upload and management
- Media control and statistics dashboard
- Content categorization (genres, albums, artists)
- User management
- Subscription and payment processing
- Analytics and reporting

## Technology Stack

### Backend
- Node.js with Express.js
- PostgreSQL for primary database
- Redis for caching and real-time features
- JWT for authentication
- Sequelize ORM

### Frontend (to be implemented)
- React.js
- Redux for state management
- Material-UI or Tailwind CSS

## Prerequisites

- Node.js (v14+)
- PostgreSQL
- Redis
- NPM or Yarn

## Getting Started

### Quick Setup

Use our automated setup script to quickly set up and start the application:

```bash
cd backend
chmod +x scripts/start.sh
./scripts/start.sh
```

To set up with Docker:

```bash
./scripts/start.sh --docker
```

### Manual Installation

If you prefer to set up manually, follow these steps:

1. Clone the repository:
```bash
git clone https://github.com/yourusername/music-streaming-platform.git
cd music-streaming-platform
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in the `.env` file.

5. Complete database setup (create, migrate, and seed):
```bash
npm run db:setup
```

Or run each step individually:
```bash
npm run db:create   # Create the database
npm run db:migrate  # Set up the database schema
npm run db:seed     # Seed the database with initial data
```

### Running the Application

1. Start the backend server:
```bash
npm run dev  # Development mode with hot reloading
# or
npm start    # Production mode
```

2. Access the API documentation:
```
http://localhost:5000/api-docs
```

### Docker Setup

To run the application using Docker:

1. Start the Docker containers:
```bash
npm run docker:up
```

2. Set up the database:
```bash
npm run db:setup
```

Or use the combined command:
```bash
npm run docker:setup
```

3. Access the API at `http://localhost:5000`

## Default Login Credentials

After setting up the database with seed data, you can use the following credentials to login:

### Admin User
- Email: admin@example.com
- Password: admin123

### Regular User
- Email: user@example.com
- Password: user123

## Troubleshooting

If you encounter any issues during setup or operation, please refer to our [Troubleshooting Guide](docs/troubleshooting.md) which covers common problems and their solutions.

### Common Issues

#### Database Connection Issues
- Ensure PostgreSQL is running and accessible
- Check that the database credentials in `.env` are correct
- If using Docker, ensure the PostgreSQL container is running: `docker ps`

#### Redis Connection Issues
- Ensure Redis is running and accessible
- If using Docker, check the Redis container status: `docker ps`

#### File Upload Issues
- Ensure the upload directories exist and have proper permissions
- Check the maximum file size configuration in `.env`

#### JWT Authentication Issues
- Verify that JWT secrets are properly set in the `.env` file
- Check that token expiration times are appropriate for your use case

#### Docker Issues
- Run `docker-compose logs` to view container logs
- Ensure ports are not already in use by other applications
- Check docker-compose configuration for any errors

For more detailed troubleshooting steps, see the full [Troubleshooting Guide](docs/troubleshooting.md).

## Project Structure

```
music-streaming-platform/
├── backend/                    # Express.js backend
│   ├── src/
│   │   ├── api/                # API routes
│   │   ├── config/             # Configuration files
│   │   ├── models/             # Database models
│   │   ├── services/           # Business logic
│   │   ├── middlewares/        # Custom middlewares
│   │   ├── utils/              # Utility functions
│   │   └── app.js              # Express app setup
│   ├── uploads/                # Upload directory for media files
│   ├── .env                    # Environment variables
│   └── server.js               # Server entry point
├── frontend/                   # React.js frontend (to be implemented)
└── docker/                     # Docker configuration
```

## API Documentation

The API documentation is available at `/api-docs` when running the application. This documentation is generated using Swagger.

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected endpoints, you need to include the JWT token in the Authorization header as a Bearer token.

### Authentication Flow

1. Register a new user: `POST /api/auth/register`
2. Login to get access token: `POST /api/auth/login`
3. Use the access token in the Authorization header: `Authorization: Bearer YOUR_TOKEN_HERE`
4. Refresh the token when it expires: `POST /api/auth/refresh-token`

## Subscription Plans

The platform offers different subscription plans:

1. **Free Tier**
   - Ad-supported streaming
   - Standard quality audio
   - No offline downloads
   - Create and manage playlists

2. **Premium Plan**
   - Ad-free streaming
   - High quality audio
   - Offline downloads
   - All features of free tier

3. **Family Plan**
   - Up to 6 accounts
   - All premium features
   - Shared payment

## Shared Listening Sessions

The shared listening feature allows users to listen to the same music simultaneously. This feature uses Redis for real-time synchronization.

### How to Use Shared Listening

1. Create a new session: `POST /api/sessions`
2. Invite friends by sharing the session ID
3. Friends join the session: `POST /api/sessions/{id}/join`
4. Host controls the playback (play, pause, skip tracks)
5. All participants hear the same music at the same time

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request