# VocalSpace Frontend

React + Vite frontend for VocalSpace - AI-Powered Speech Therapy Platform

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   └── Navbar.jsx       # Navigation bar
│   ├── pages/               # Page components
│   │   ├── Landing.jsx      # Landing page
│   │   ├── Auth.jsx         # Login/Register
│   │   ├── CompleteProfile.jsx
│   │   ├── user/            # User pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Practice.jsx
│   │   │   ├── Progress.jsx
│   │   │   └── PhonemeLibrary.jsx
│   │   └── admin/           # Admin pages
│   │       └── Dashboard.jsx
│   ├── store/               # State management (Zustand)
│   │   ├── authStore.js     # Authentication state
│   │   └── themeStore.js    # Theme state
│   ├── utils/
│   │   └── api.js           # Axios instance
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/
│   └── logo.png             # Your logo here
├── .env.example             # Environment template
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:8000`

### Installation

1. **Install dependencies**
```bash
npm install
# or
yarn install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env if needed
```

3. **Add your logo**
```bash
# Place your logo.png in the public/ folder
cp /path/to/your/logo.png public/logo.png
```

4. **Run development server**
```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:3000`

## 🎨 Features

### Design System

- **Colors**: Purple, Pink, Red, Blue, Black, White
- **Themes**: Light and Dark mode
- **Responsive**: Mobile, Tablet, Desktop
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Pages

#### Landing Page
- Hero section with gradient text
- Features showcase
- How it works
- About section
- Contact form
- Responsive navbar

#### Authentication
- Email/Password login
- Google OAuth (coming soon)
- Sign up flow
- Password visibility toggle

#### Complete Profile
- Profile picture upload
- Personal information
- Speech disorder details
- Therapy goals
- Interests

#### User Dashboard
- Statistics cards (Streak, XP, Accuracy, Sessions)
- Personalized sentences
- Quick actions
- Progress overview

#### Practice Session
- Sentence display
- Audio recording
- Real-time feedback
- Phoneme analysis
- Progress tracking

#### Progress Page
- Accuracy trend chart
- Phoneme error frequency
- Session history
- Visual analytics

#### Phoneme Library
- Categorized phonemes
- Audio examples
- Practice mode
- Detailed information

#### Admin Dashboard
- Platform statistics
- Patient overview
- Performance metrics
- User management

## 🎨 Styling

### Tailwind CSS

Custom theme configuration in `tailwind.config.js`:

```javascript
colors: {
  primary: { /* Purple shades */ },
  accent: {
    pink: '#ec4899',
    red: '#ef4444',
    blue: '#3b82f6',
  }
}
```

### Custom Classes

```css
.btn-primary      /* Primary button */
.btn-secondary    /* Secondary button */
.card             /* Card container */
.input-field      /* Form input */
```

### Dark Mode

Toggle with moon/sun icon in navbar. Persisted in localStorage.

## 🔐 Authentication Flow

1. User visits landing page
2. Clicks "Sign Up" or "Sign In"
3. Completes authentication
4. First-time users → Complete Profile
5. Redirects to appropriate dashboard

### Protected Routes

- `/user/*` - Requires user role
- `/admin-dashboard` - Requires therapist role
- `/complete-profile` - Requires authentication

## 📱 Responsive Design

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Features

- Hamburger menu (to be implemented)
- Touch-friendly buttons
- Optimized layouts
- Responsive charts

## 🎭 Animations

Using Framer Motion:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

## 🗂️ State Management

### Zustand Stores

**authStore.js**
- User data
- Authentication token
- Login/logout functions

**themeStore.js**
- Theme preference (light/dark)
- Toggle function

## 🌐 API Integration

### Axios Configuration

```javascript
// Base URL from environment
const API_URL = import.meta.env.VITE_API_URL

// Automatic token injection
// Automatic 401 handling
```

### API Calls

```javascript
import api from '../utils/api'

// GET request
const { data } = await api.get('/user/stats')

// POST request
const { data } = await api.post('/auth/login', { email, password })

// File upload
const formData = new FormData()
formData.append('audio', audioBlob)
await api.post('/ai/analyze', formData)
```

## 🎤 Audio Recording

Using Web Audio API:

```javascript
// Request microphone access
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

// Create recorder
const mediaRecorder = new MediaRecorder(stream)

// Handle data
mediaRecorder.ondataavailable = (event) => {
  audioChunks.push(event.data)
}

// Stop and create blob
mediaRecorder.onstop = () => {
  const blob = new Blob(audioChunks, { type: 'audio/wav' })
}
```

## 📊 Charts

Using Recharts:

```jsx
import { LineChart, Line, XAxis, YAxis } from 'recharts'

<LineChart data={accuracyData}>
  <Line type="monotone" dataKey="accuracy" stroke="#9333ea" />
</LineChart>
```

## 🚀 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Optimization

- Code splitting
- Tree shaking
- Asset optimization
- Lazy loading

### Deployment

**Vercel**
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## 🔧 Environment Variables

```bash
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🧪 Testing

```bash
# Install testing libraries
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Run tests
npm run test
```

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#your-color',
  }
}
```

### Add New Pages

1. Create component in `src/pages/`
2. Add route in `App.jsx`
3. Add navigation link

### Modify Animations

Edit Framer Motion props:
```jsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.5 }}
```

## 📝 Code Style

- Use functional components
- Use hooks for state
- Use async/await for API calls
- Use Tailwind for styling
- Use meaningful variable names

## 🐛 Troubleshooting

### API Connection Error
```bash
# Check backend is running
curl http://localhost:8000/health

# Check CORS settings in backend
```

### Build Errors
```bash
# Clear cache
rm -rf node_modules
rm package-lock.json
npm install
```

### Audio Recording Not Working
```bash
# Check browser permissions
# Use HTTPS in production (required for getUserMedia)
```

## 📄 License

MIT License
