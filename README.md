# TestPal - AI-Powered Exam Preparation Platform

TestPal is a web-based application designed to help students prepare for exams by analyzing their past performance and generating personalized practice materials. The platform uses AI to provide tailored learning experiences and actionable insights.

## Features

### 🎯 Core Features
- **Student Dashboard**
  - Track past test results and performance metrics
  - View topic-wise strength and weakness analysis
  - Get personalized improvement suggestions

- **Performance Analytics**
  - Detailed progress tracking over time
  - Subject and topic-wise performance trends
  - AI-powered performance insights

- **Custom Practice Papers**
  - Generate personalized practice tests
  - Adjustable difficulty levels and duration
  - AI-generated questions using Google's Generative AI

- **Learning Recommendations**
  - Personalized study material suggestions
  - Custom study schedules
  - Topic-focused improvement plans

### 👥 Collaborative Features
- Study group formation
- Peer-to-peer discussions
- Collaborative learning spaces

### 🎮 Engagement Features
- Achievement badges
- Performance leaderboards
- Progress milestones

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Shadcn/UI Components
- Recharts for data visualization
- React Query for state management

### Backend
- Node.js with Express.js
- PostgreSQL database
- Prisma ORM
- Google Generative AI integration
- JWT authentication

### Development Tools
- TypeScript
- Vite
- ESBuild
- Drizzle Kit

## Getting Started

### Prerequisites
- Node.js (Latest LTS version)
- PostgreSQL database
- Google AI API key

### Environment Setup
1. Clone the repository
2. Create a `.env` file with the following variables:
```env
DATABASE_URL="your_postgresql_connection_string"
GOOGLE_AI_API_KEY="your_google_ai_api_key"
```

### Installation
```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```



