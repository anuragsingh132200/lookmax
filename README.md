# LookMax - Lookmaxxing App

A comprehensive mobile app for face analysis and self-improvement with AI-powered recommendations, subscription-based premium features, and expert course content.

## 🏗️ Project Structure

```
lookmax/
├── backend/          # FastAPI Python backend
├── mobile/           # Expo React Native app (SDK 54)
└── admin/            # Next.js admin panel
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env file with your API keys

# Seed database with admin user & sample data
python seed.py

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npx expo start
```

Scan QR code with Expo Go app or press `a` for Android / `i` for iOS simulator.

### 3. Admin Panel Setup

```bash
cd admin

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default Admin Login:**
- Email: `admin@lookmax.com`
- Password: `admin123`

## 🔧 Environment Variables

### Backend (.env)

```env
MONGODB_URL=mongodb://localhost:27017/lookmax
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
```

### Mobile (Update in services/api.ts)

Update the `API_URL` to point to your backend server.

### Admin (Create .env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📱 App Features

### User Flow

1. **Login/Signup** - Create account or sign in
2. **Feature Highlights** - Swipeable intro screens
3. **Onboarding** - 3-step questionnaire (saved to DB)
4. **Face Scanner** - Camera-based face capture
5. **AI Analysis** - Gemini Flash analyzes facial features
6. **Blurred Results** - Teaser view for non-subscribers
7. **Payment** - Stripe subscription checkout
8. **GlowUp Guide** - Video/image course modules
9. **Progress Tracking** - Track completed chapters

### Admin Features

- Dashboard with user/subscription stats
- User management (view, delete)
- Course CRUD operations
- Module & chapter management

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile App | Expo SDK 54, React Native |
| Backend | FastAPI, Python |
| Admin Panel | Next.js 14, TypeScript, Tailwind |
| Database | MongoDB |
| AI | Google Gemini Flash API |
| Payments | Stripe |
| Auth | JWT |

## 📂 Key Files

### Backend
- `app/main.py` - FastAPI entry point
- `app/services/gemini.py` - Face analysis AI
- `app/services/stripe_service.py` - Payment handling
- `app/routers/` - API endpoints

### Mobile
- `app/_layout.tsx` - Root navigation
- `app/(auth)/` - Login/signup screens
- `app/(onboarding)/` - Onboarding flow
- `app/(scan)/` - Face scanner & results
- `app/(main)/` - Home, courses, progress

### Admin
- `src/app/dashboard/` - Dashboard pages
- `src/lib/api.ts` - API client

## 🔐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User login |
| `/api/users/me` | GET | Get current user |
| `/api/users/onboarding` | POST | Save onboarding data |
| `/api/scans/analyze` | POST | Analyze face image |
| `/api/courses` | GET | List courses |
| `/api/progress/{courseId}` | PUT | Update progress |
| `/api/payments/create-payment-intent` | POST | Create Stripe payment |

## 📝 License

MIT
