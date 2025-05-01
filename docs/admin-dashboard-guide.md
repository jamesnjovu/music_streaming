# Music Streaming Admin Dashboard Setup Guide

This guide will walk you through setting up and running the admin dashboard for your music streaming platform.

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Your music streaming backend API running (on localhost:5000 by default)

## Setup Steps

### 1. Clone the Repository

```bash
git clone <repository-url> music-streaming-admin
cd music-streaming-admin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following content:

```
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-at-least-32-chars

# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Make sure to replace `your-secret-key-at-least-32-chars` with a secure random string (at least 32 characters long).

### 4. Run the Development Server

```bash
npm run dev
```

The admin dashboard will be available at [http://localhost:3000](http://localhost:3000).

### 5. Build for Production

```bash
npm run build
```

### 6. Start the Production Server

```bash
npm start
```

## Authentication

For demonstration purposes, the admin dashboard uses a simple credentials-based authentication system. In a real-world scenario, you would connect this to your backend authentication system.

### Default Admin Credentials

- Email: `admin@example.com`
- Password: `admin123`

## Dashboard Features

The admin dashboard includes the following features:

### 1. Dashboard Overview
- Statistics cards showing key metrics
- Activity charts displaying track plays, user growth, and subscriptions
- Top performers lists (tracks, artists, albums)
- Recent tracks table

### 2. User Management
- View and manage users
- Edit user details and permissions
- Activate/deactivate user accounts

### 3. Content Management
- Tracks management (upload, edit, delete)
- Album management
- Artist management

### 4. Subscription Management
- Manage subscription plans
- View user subscriptions

### 5. Analytics
- Overview analytics
- User analytics
- Content analytics
- Revenue analytics

### 6. Settings
- Platform settings configuration

## Folder Structure

```
music-streaming-admin/
├── app/                             # App Router pages
│   ├── api/                         # API routes
│   ├── admin/                       # Admin dashboard pages
│   ├── login/                       # Login page
│   └── layout.tsx                   # Root layout
├── components/                      # React components
│   ├── ui/                          # UI components
│   ├── admin/                       # Admin-specific components
│   └── providers/                   # Context providers
├── lib/                             # Utility functions and libraries
├── types/                           # TypeScript type definitions
└── public/                          # Static assets
```

## Connecting to Your Backend

The admin dashboard is designed to connect to your music streaming backend API. By default, it expects the API to be running at `http://localhost:5000/api`.

If your API is running at a different URL, update the `NEXT_PUBLIC_API_URL` environment variable in the `.env.local` file.

## Extending the Dashboard

### Adding New Pages

1. Create a new page in the appropriate directory under `app/admin/`
2. Add navigation to the new page in `components/admin/Sidebar.tsx`

### Adding New API Endpoints

1. Create a new API function in `lib/api/`
2. Use the API function in your components or pages

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Make sure your backend API is running
2. Check that the `NEXTAUTH_SECRET` and `NEXTAUTH_URL` environment variables are set correctly
3. Verify that the credentials you're using are correct

### API Connection Issues

If the admin dashboard can't connect to your backend API:

1. Make sure your backend API is running
2. Check that the `NEXT_PUBLIC_API_URL` environment variable is set to the correct URL
3. Check your browser console for CORS errors

## Customization

### Theme Customization

The admin dashboard uses a customizable theme that you can adjust in `app/globals.css`. You can change colors, typography, and other design elements to match your brand.

### Layout Customization

You can customize the layout by modifying the components in the `components/admin/` directory.

## Deployment

### Deploying to Vercel

The easiest way to deploy the admin dashboard is to use Vercel:

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy

### Deploying to Other Platforms

You can also deploy the admin dashboard to other platforms like Netlify, AWS, or your own server:

1. Build the application: `npm run build`
2. Deploy the `.next` directory and other necessary files
3. Configure environment variables on your hosting platform

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.