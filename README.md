# LookMax - Your Personal Glow-Up Guide 💎

A comprehensive self-improvement mobile application featuring AI-powered face scanning, personalized routines, community features, and premium content delivery.

## 🏗️ Architecture

```
lookmax/
├── docker-compose.yml      # Docker orchestration
├── .env                    # Environment variables
├── mongo-init.js           # MongoDB initialization
├── backend/                # FastAPI Python Backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── routers/        # API endpoints
│       ├── models/         # Pydantic models
│       └── utils/          # JWT, password, LLM
├── lookmax-app/            # React Native Expo App
│   ├── app/
│   │   ├── (tabs)/         # Main tab navigation
│   │   ├── (auth)/         # Login, register, onboarding
│   │   ├── scanner/        # Face scanner with camera
│   │   └── paywall/        # Premium subscription
│   ├── services/           # API clients
│   └── context/            # Auth state management
└── admin-panel/            # React Admin Dashboard
    └── src/
        ├── pages/          # Dashboard, Users, Content, Events
        └── components/     # Sidebar, etc.
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Google AI API Key (for Gemini)

### 1. Clone & Configure
```bash
cd lookmax

# Copy and edit environment variables
cp .env.example .env
# Edit .env and add your GOOGLE_AI_API_KEY
```

### 2. Start Backend Services
```bash
# Start MongoDB, Backend, and Admin Panel
docker-compose up -d

# Check services are running
docker-compose ps
```

**Access Points:**
- **API**: http://localhost:8000 (Swagger docs at /docs)
- **Mongo Express**: http://localhost:8081 (admin/admin123)
- **Admin Panel**: http://localhost:5173

### 3. Start Mobile App
```bash
cd lookmax-app

# Install dependencies
npm install

# Start Expo
npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/client) on your phone.

## 📱 Features

### Mobile App
| Feature | Description |
|---------|-------------|
| **Face Scanner** | AI-powered facial analysis using Google Gemini |
| **Home Dashboard** | Stats, quick actions, glow-up plan preview |
| **Community Forum** | Post, like, and discuss with others |
| **Chat Rooms** | Topic-based messaging (skincare, fitness, etc.) |
| **Profile/Stats** | Scan history, baseline metrics, progress tracking |
| **Paywall** | Premium subscription for full course access |

### Admin Panel
| Feature | Description |
|---------|-------------|
| **Dashboard** | Analytics overview (users, scans, conversion rate) |
| **Users** | Manage users, toggle premium, delete accounts |
| **Content** | CRUD for courses and guides by category |
| **Events** | Create coaching sessions and community events |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Face Scanner
- `POST /api/scanner/analyze` - Analyze face photo (base64)
- `GET /api/scanner/history` - Get scan history
- `GET /api/scanner/compare/{id1}/{id2}` - Compare two scans

### Users
- `PUT /api/users/onboarding` - Save onboarding data
- `GET /api/users/profile` - Get profile
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/leaderboard` - Get rankings

### Content
- `GET /api/content/courses` - Get all courses
- `GET /api/content/glow-up-plan` - Personalized plan

### Community
- `GET /api/community/posts` - Get forum posts
- `POST /api/community/posts` - Create post
- `POST /api/community/posts/{id}/like` - Like/unlike
- `GET /api/community/chats` - Get chat rooms
- `POST /api/community/chat/messages` - Send message

### Admin (requires admin role)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `POST /api/admin/content` - Create content
- `POST /api/admin/events` - Create event
- `GET /api/admin/analytics` - Get analytics

## 🔐 Default Credentials

| Service | Username/Email | Password |
|---------|---------------|----------|
| Admin Panel | admin@lookmax.com | admin123 |
| Mongo Express | admin | admin123 |

## 🛠️ Development

### Backend (with hot reload)
```bash
docker-compose up backend
```

### Admin Panel (local)
```bash
cd admin-panel
npm install
npm run dev
```

### Mobile App (with Metro bundler)
```bash
cd lookmax-app
npm install
npx expo start
```

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile App** | React Native + Expo Router |
| **Admin Panel** | React + Vite |
| **Backend** | FastAPI (Python) |
| **Database** | MongoDB |
| **AI/LLM** | Google Gemini 1.5 Flash |
| **Auth** | JWT (python-jose) |
| **Container** | Docker + Docker Compose |

## ⚠️ Important Notes

1. **GOOGLE_AI_API_KEY**: Required for face scanning. Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. **Mobile API URL**: Update `services/api.js` with your machine's IP for device testing:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:8000';
   ```

3. **Production**: Change all secrets in `.env` before deploying!

## 📄 License

MIT License
