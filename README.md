# Guest-Flow-Control - Visitor Management System

A web-based visitor management system for office buildings, handling visitor registration, check-in/check-out, and staff notifications.

## Features

- Visitor registration with ID scanning and photo capture
- QR code-based guest pass system
- Real-time check-in/check-out tracking
- Staff SMS notifications
- Admin dashboard with analytics and reports
- Touch-friendly interface optimized for reception desks

## Tech Stack

- **Frontend**: React + TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js + TypeScript, PostgreSQL with Drizzle ORM
- **Storage**: Google Cloud Storage for files
- **Authentication**: Passport.js with local strategy

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud Storage bucket with service account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

- Install and start PostgreSQL
- Create a database
- Set the `DATABASE_URL` environment variable:

  ```
  DATABASE_URL=postgresql://username:password@localhost:5432/database_name
  ```

- Push the schema:
  ```bash
  npm run db:push
  ```

### 3. Google Cloud Storage Setup

- Create a Google Cloud Storage bucket
- Create a service account with Storage Object Admin permissions
- Download the service account JSON key file
- Set environment variables:
  ```
  GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
  PUBLIC_OBJECT_SEARCH_PATHS=/your-bucket-name/public
  PRIVATE_OBJECT_DIR=/your-bucket-name/private
  ```

### 4. Environment Variables

Create a `.env` file or set environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to GCS service account key
- `PUBLIC_OBJECT_SEARCH_PATHS` - GCS paths for public objects (comma-separated)
- `PRIVATE_OBJECT_DIR` - GCS path for private objects
- `PORT` - Server port (default: 5000)

### 5. Run the Application

For development:

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

For production:

```bash
npm run build
npm run start
```

## Usage

1. Access the admin panel to set up destinations and staff contacts
2. Visitors register at the landing page
3. Reception staff can check-in/out visitors using QR codes
4. Staff receive SMS notifications for visitor arrivals

## Troubleshooting

- Ensure all environment variables are set
- Verify database connection and schema
- Check GCS bucket permissions and paths
- For OCR and webcam features, ensure HTTPS in production (required for camera access)

## Development

- `npm run check` - TypeScript type checking
- `npm run db:push` - Update database schema
