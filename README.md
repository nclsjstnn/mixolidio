# Mixolidio

A browser-based Digital Audio Workstation (DAW) inspired by Ableton Live. Built with Next.js 14+, TypeScript, and the Web Audio API.

## Features

- **Google OAuth Authentication** - Secure sign-in with Google accounts
- **Audio File Upload** - Upload samples up to 50MB (MP3, WAV, OGG, FLAC, WebM)
- **Timeline Arrangement** - Drag and drop audio clips on a visual timeline
- **Multi-track Mixing** - Independent volume, mute, and solo controls per track
- **Real-time Playback** - Web Audio API powered playback engine
- **Project Management** - Save and load multiple projects
- **Cloud Storage** - Audio files stored on Vercel Blob, project data in MongoDB

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Mongoose
- **File Storage**: Vercel Blob
- **Audio Engine**: Web Audio API
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (Atlas recommended)
- Google Cloud Console project with OAuth 2.0 credentials
- Vercel account with Blob storage

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Fill in your credentials in `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Build

```bash
npm run build
npm start
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Create an **OAuth 2.0 Client ID**
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://mixolidio.com/api/auth/callback/google` (production)

## Deployment

Deploy to Vercel:

1. Connect your repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Enable Vercel Blob in Storage settings
4. Deploy

## Project Structure

```
src/
  app/
    api/              # API routes
    login/            # Login page
    setup-username/   # Username selection page
    page.tsx          # Main DAW interface
  components/         # React components
  hooks/              # Custom React hooks
  lib/
    models/           # Mongoose models
    auth.ts           # NextAuth configuration
    mongoose.ts       # Database connection
    playback.ts       # Audio playback engine
  types/              # TypeScript interfaces
```

## License

MIT
