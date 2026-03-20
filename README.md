# TabMind 🧠
> The digital memory your browser never had — capture, track, and analyze the intent behind every tab.

## The Problem
The average knowledge worker keeps dozens of tabs open, losing the original context and intent within minutes. This leads to browser anxiety, cognitive clutter, and lost productivity as tabs either become permanent residents or get closed along with their important unfulfilled tasks.

## What It Does
TabMind is a Chrome Extension + MERN fullstack ecosystem that captures your intent the moment you open a tab and preserves it forever. Your intents are surfaced contextually on hover, archived in a searchable dashboard graveyard, and analyzed into weekly behavioral insights. It transforms your browser from a chaotic list of URLs into a structured trail of purposeful actions.

## Features
- 🧠 **Intent Capture**: Non-intrusive popups that ask "Why are you opening this?" the moment a tab appears.
- 🎴 **Tab Context Card**: Floating hover cards that reveal a tab's intent and active time without clicking.
- 🤖 **AI Intent Suggestion**: Automatic intent generation using GPT-4o-mini for skipped prompts.
- ✅ **Fulfillment Tracking**: Status-based tab management (Open, Done, Saved, Abandoned).
- 🪦 **Tab Graveyard**: A permanent, searchable archive of every closed tab and its original intent.
- 📂 **Session Groups**: Auto-clustering of related tabs into named workspaces for easy restoration.
- 📊 **Weekly Focus Digest**: Spotify Wrapped style reports on your browsing habits and "Tab Personality."
- 🎯 **Focus Mode**: Gentle AI-powered warnings when opening tabs unrelated to your current goal.

## Tech Stack
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## Architecture
```text
┌────────────────────────┐      ┌──────────────────────────┐      ┌────────────────────────┐
│   Chrome Extension     │      │    Node.js Backend       │      │    React Dashboard     │
│ (React + Vite + MV3)   │      │   (Express + JWT)        │      │ (Tailwind + Recharts)  │
└──────────┬─────────────┘      └────────────┬─────────────┘      └────────────┬───────────┘
           │                                 │                                 │
           │  1. Capture Intent              │                                 │
           ├────────────────────────────────>│  2. Store in MongoDB            │
           │                                 │  3. Emit via Socket.io          │
           │                                 ├────────────────────────────────>│
           │                                 │                                 │
           │ <───────────────────────────────┤                                 │
           │  4. Refresh Local Cache         │                                 │
           │                                 │ <───────────────────────────────┤
           │                                 │  5. Fetch History/Analytics     │
           │                                 │                                 │
           └─────────────────────────────────┴─────────────────────────────────┘
```

## Screenshots
### ⚡ Intent Popup
*(Placeholder)*: *A sleek, dark overlay in the top-right corner of a browser page.*

### 📊 Dashboard
*(Placeholder)*: *The main dashboard with fulfillment rings and live tab tracking.*

### 🪦 Graveyard
*(Placeholder)*: *The searchable archive of all past tab intents.*

### 📧 Weekly Digest
*(Placeholder)*: *The premium "Tab Personality" card for social sharing.*

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/PrakharJain345/TabMind.git
cd TabMind
```

### 2. Install Dependencies
Install dependencies for all three major components:
```bash
# Backend
cd backend && npm install
# Dashboard
cd ../dashboard && npm install
# Extension
cd ../extension && npm install
```

### 3. Set Environment Variables
Create a `.env` file in the `backend` directory based on the following:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
DASHBOARD_URL=http://localhost:3000
```

### 4. Run the Project
```bash
# Start Backend (from /backend)
npm run dev

# Start Dashboard (from /dashboard)
npm run dev
```

### 5. Load the Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `/extension/dist` folder (ensure you've run `npm run build` in the extension folder first).

## Environment Variables
| Variable | Description |
|---|---|
| `MONGO_URI` | Connection string for MongoDB Atlas |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens |
| `GROQ_API_KEY` | Your Groq API key for GPT-powered intent suggestions and personality generation |
| `GOOGLE_CLIENT_ID` | OAuth2 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth2 Client Secret from Google Cloud Console |
| `DASHBOARD_URL` | The URL where the React dashboard is running |

## API Reference
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/google` | Public: Google OAuth login, returns JWT |
| `GET` | `/api/auth/me` | Private: Get current user profile |
| `POST` | `/api/tabs` | Private: Create new tab record |
| `PATCH` | `/api/tabs/:id` | Private: Update status, intent, or fulfillment |
| `GET` | `/api/tabs/graveyard` | Private: Fetch all closed tab history |
| `GET` | `/api/tabs/open` | Private: Fetch currently active tabs |
| `POST` | `/api/tabs/ai-intent` | Private: Generate AI intent suggestion |
| `POST` | `/api/sessions` | Private: Save current tabs as a named session |
| `GET` | `/api/analytics/overview` | Private: Get lifetime stats and fulfillment trends |
| `GET` | `/api/digest/latest` | Private: Fetch the most recent weekly digest card |

## Roadmap
- [x] Intent capture
- [x] Tab graveyard  
- [x] Session groups
- [x] AI suggestions
- [x] Weekly digest
- [ ] Firefox support
- [ ] Team sessions
- [ ] Mobile companion app

## License
MIT
