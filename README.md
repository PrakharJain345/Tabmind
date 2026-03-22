# TabMind

A full-stack ecosystem designed to capture, track, and analyze the intent behind every browser tab. TabMind transforms standard web browsing into a purposeful and structured workflow by bridging the gap between momentary browsing actions and long-term productivity goals.

---

## Overview

Modern knowledge work often involves managing dozens of concurrent browser tabs, leading to "tab fatigue" and loss of context. TabMind addresses this by requiring users to declare their intent upon opening a new tab. This intent is then preserved, surfaced contextually, and archived for later analysis.

The system consists of three primary components:
1.  **Chrome Extension**: A high-performance Manifest V3 extension providing real-time intent capture and contextual hover cards.
2.  **Web Dashboard**: A React-based application for managing live tabs, browsing archives (The Graveyard), and behavioral analytics.
3.  **Backend Services**: A Node.js/Express API powered by MongoDB for persistence and real-time synchronization via Socket.io.

---



## Key Capabilities

### 1. Unified Intent Capture
The Chrome extension utilizes a non-intrusive Shadow DOM overlay to prompt users for their intent immediately upon tab creation. This ensures that every tab has a defined purpose from the outset.

### 2. Contextual Awareness (Hover Cards)
Using an `Alt+I` global shortcut, users can trigger a floating context card that displays the tab's recorded intent, active duration, and fulfillment status without requiring a tab switch.

### 3. The Graveyard (Archive)
A permanent, searchable repository of all closed tabs. Users can revisit past research sessions, retrieve forgotten URLs, and review the original context in which those pages were opened.

### 4. Behavioral Analytics
A comprehensive analytics engine that generates weekly focus digests. It tracks fulfillment rates (percentage of tabs closed as 'Done' vs 'Abandoned') and provides deep insights into browsing habits.

---


## Technical Architecture

The architecture is designed for low-latency synchronization and high reliability:

1.  **Capture**: The Extension captures intent and beams it to the Backend via REST API.
2.  **Persistence**: The Backend stores tab metadata and analytics in MongoDB.
3.  **Real-Time Sync**: Changes are broadcast to the React Dashboard via Socket.io for immediate UI updates.
4.  **Security**: JWT-based authentication ensures data privacy across the ecosystem.

---

## Technical Stack

| Category | Technologies |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Socket.io |
| **Extension** | Vite, CRXJS, Manifest V3, Content Scripts (Shadow DOM) |
| **Intelligence** | Groq API (GPT-powered intent suggestions) |
| **Deployment** | Vercel (Frontend), Render/DigitalOcean (Backend) |

---

## Deployment and Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Groq API Key (for AI features)

### 2. Installation

Clone the repository and install dependencies for each component:

```bash
# Clone
git clone https://github.com/PrakharJain345/TabMind.git
cd TabMind

# Install Backend dependencies
cd backend && npm install

# Install Dashboard dependencies
cd ../dashboard && npm install

# Install Extension dependencies
cd ../extension && npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_oauth_id
DASHBOARD_URL=http://localhost:3000
```

### 4. Running the Development Environment

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Dashboard
cd dashboard && npm run dev

# Terminal 3: Extension (Build & Watch)
cd extension && npm run dev
```

### 5. Loading the Extension in Chrome
1.  Navigate to `chrome://extensions/`.
2.  Enable **Developer mode**.
3.  Click **Load unpacked**.
4.  Select the `extension/dist` directory.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check and uptime |
| `POST` | `/api/auth/google` | User authentication via Google OAuth |
| `GET` | `/api/tabs/open` | Retrieve currently active tabs |
| `PATCH` | `/api/tabs/:id` | Update tab status (Done, Abandoned, Saved) |
| `GET` | `/api/analytics/overview` | Fetch behavioral trends and stats |

---

## License
This project is licensed under the MIT License.
