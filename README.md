# PodSphere AI

PodSphere AI is an advanced, AI-powered content management and generation platform. It allows creators to upload videos, automatically extract audio, generate AI-driven transcripts, translations, chapters, summaries, and SEO-optimized articles using Gemini.

## Features

- **Automated Processing**: Extract audio from videos automatically using FFMPEG.
- **AI Content Generation**: Powered by Google's Gemini, automatically generate:
  - Transcripts & Translations
  - Summaries & Chapters
  - SEO-optimized articles
- **Robust Storage**: Uses Cloudinary with a smart fallback mechanism (multi-account failover) to handle large video uploads.
- **Modern Interface**: A sleek frontend built with React, Vite, Framer Motion, and Wavesurfer.js for audio visualization.
- **Analytics & Dashboard**: Visual charts and dashboards using Recharts to track content performance.

## Tech Stack

### Frontend
- **Framework**: React 19, Vite, TypeScript
- **Styling & Animations**: CSS, Framer Motion, Lucide React
- **Audio/Video**: Wavesurfer.js
- **Routing & Forms**: React Router DOM, React Hook Form
- **Data Visualization**: Recharts

### Backend
- **Framework**: Node.js, Express, TypeScript
- **Database**: MongoDB (Mongoose)
- **AI Integrations**: `@google/genai` (Gemini API)
- **Media Processing**: `fluent-ffmpeg`, Cloudinary (multi-account configuration)
- **Authentication**: JWT, bcrypt

## Prerequisites

- Node.js (v18+)
- MongoDB connection string
- Cloudinary Account(s) (Primary, Secondary, Tertiary recommended for failover)
- Gemini API Key

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd podsphere-ai
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   
   GEMINI_API_KEY=your_gemini_api_key
   
   CLOUDINARY_CLOUD_NAME=your_primary_cloud_name
   CLOUDINARY_API_KEY=your_primary_api_key
   CLOUDINARY_API_SECRET=your_primary_api_secret
   
   CLOUDINARY_CLOUD_NAME_2=your_secondary_cloud_name
   CLOUDINARY_API_KEY_2=your_secondary_api_key
   CLOUDINARY_API_SECRET_2=your_secondary_api_secret
   
   CLOUDINARY_CLOUD_NAME_3=your_tertiary_cloud_name
   CLOUDINARY_API_KEY_3=your_tertiary_api_key
   CLOUDINARY_API_SECRET_3=your_tertiary_api_secret
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   *(Add any required `.env` variables for the frontend here if needed, such as `VITE_API_URL`)*

## Running the Application

You can start both the frontend and backend concurrently or run them in separate terminals.

**Start the Backend:**
```bash
cd backend
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will typically be accessible at `http://localhost:5173` and the backend at `http://localhost:5000`.

## Architecture Overview

1. **Upload Flow**: Users upload a video up to 100MB (or compressed if larger).
2. **Audio Extraction**: The backend uses FFMPEG to strip the audio into an `.mp3` file.
3. **Cloudinary Upload**: The media is pushed to Cloudinary. If the primary account is >90% full, it automatically falls back to secondary accounts.
4. **AI Generation**: A background job invokes Gemini to transcribe the audio, create chapters, summarize it, translate it, and produce an SEO blog post.
5. **Consumption**: Users can listen to the generated podcast on the frontend using the custom Wavesurfer.js player or read the AI-generated articles.
