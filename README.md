# 🤫 Whisper — Anonymous Q&A Platform

A full-featured anonymous question & answer API built with **Node.js**, **Express 5**, **MongoDB**, and **Socket.io**. Users can receive anonymous questions, answer them publicly or privately, and browse a global feed — all with real-time notifications.

---

## ✨ Features

| Category | Feature |
|---|---|
| 🔐 **Auth** | Signup, Login, JWT Access + Refresh Tokens, Password Reset |
| 👤 **Profiles** | Public profiles with bio, avatar, tags, and question toggle |
| ❓ **Questions** | Send anonymous questions, answer, ignore, or delete |
| 🌐 **Feed** | Global feed with tag filtering, keyword search, and cursor pagination |
| ❤️ **Likes** | Like public answered questions (no auth required) |
| 🔒 **Privacy** | Private answers hidden from public feeds, visible only in owner's inbox |
| ⚡ **Real-time** | Socket.io notifications when someone sends you a question |
| 🛡️ **Security** | XSS sanitization, rate limiting, input validation with Zod |

---

## 🛠️ Tech Stack

- **Runtime**: Node.js ≥ 20
- **Framework**: Express 5
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Zod
- **Real-time**: Socket.io
- **Security**: xss, express-rate-limit, CORS

---

## 📁 Project Structure

```
whisper/
├── config/            # Database connection
├── controllers/       # Route handlers (auth, users, questions, feed)
├── middleware/         # Auth, validation, rate limiting
├── models/            # Mongoose schemas (User, Question)
├── routes/            # Express route definitions
├── validations/       # Zod validation schemas
├── utils/             # Error handling utilities
├── public/            # Frontend UI (static HTML + JS)
├── tester/            # Automated API test suite
├── server.js          # App entry point (Express + Socket.io)
└── .env               # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [MongoDB](https://www.mongodb.com/) running locally or a cloud URI

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/whisper.git
cd whisper

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/whisper
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_here   # optional, falls back to JWT_SECRET
```

### Run the Server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

The server will start at `http://localhost:3000`

### Run Tests

```bash
npm run test:api
```

> ✅ **53 tests** across 10 test suites — all passing

---

## 📡 API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Create a new account |
| `POST` | `/api/auth/login` | ❌ | Login with email & password |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `POST` | `/api/auth/refresh` | ❌ | Get new access token using refresh token |
| `POST` | `/api/auth/forgot-password` | ❌ | Generate password reset token |
| `POST` | `/api/auth/reset-password` | ❌ | Reset password with token |

### Users & Profiles

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users/:username` | ❌ | View public profile |
| `PATCH` | `/api/users/me` | ✅ | Update display name, bio, avatar, tags |
| `POST` | `/api/users/:username/questions` | ❌ | Send anonymous question (rate limited) |
| `GET` | `/api/users/:username/questions` | ❌ | View user's public answered questions |

### Questions (Inbox)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/questions/inbox` | ✅ | View your inbox (`?status=pending&limit=10`) |
| `POST` | `/api/questions/:id/answer` | ✅ | Answer a question |
| `PATCH` | `/api/questions/:id` | ✅ | Update answer, status, or visibility |
| `DELETE` | `/api/questions/:id` | ✅ | Delete a question |
| `POST` | `/api/questions/:id/like` | ❌ | Like a public answered question |

### Global Feed

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/feed` | ❌ | All public answered questions |
| `GET` | `/api/feed?tag=javascript` | ❌ | Filter by user tag |
| `GET` | `/api/feed?q=keyword` | ❌ | Search questions & answers |
| `GET` | `/api/feed?cursor=<id>&limit=10` | ❌ | Cursor-based pagination |
| `GET` | `/api/feed?page=2&limit=10` | ❌ | Offset-based pagination |

---

## ⚡ Real-time Notifications (Socket.io)

When someone sends you a question, you get a live notification via WebSocket.

### Client-side Usage

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

// Join your notification room after login
socket.emit("join", userId);

// Listen for new questions
socket.on("new_question", (data) => {
  console.log("New question received!", data);
  // data = { id, body, createdAt }
});
```

---

## 🔐 Authentication Flow

```
┌─────────┐                    ┌──────────┐
│  Client  │                    │  Server  │
└────┬─────┘                    └────┬─────┘
     │  POST /api/auth/login         │
     │──────────────────────────────>│
     │                               │
     │  { token, refreshToken, user }│
     │<──────────────────────────────│
     │                               │
     │  GET /api/auth/me             │
     │  Authorization: Bearer token  │
     │──────────────────────────────>│
     │                               │
     │  (token expires after 15m)    │
     │                               │
     │  POST /api/auth/refresh       │
     │  { refreshToken }             │
     │──────────────────────────────>│
     │                               │
     │  { token: newAccessToken }    │
     │<──────────────────────────────│
```

---

## 🖥️ Frontend UI

A pre-built demo frontend is included in the `/public` directory and served automatically:

| URL | Page |
|-----|------|
| `http://localhost:3000` | Landing page |
| `http://localhost:3000/signup.html` | Register |
| `http://localhost:3000/login.html` | Login |
| `http://localhost:3000/feed.html` | Global feed |
| `http://localhost:3000/inbox.html` | Your inbox |
| `http://localhost:3000/profile.html` | Edit profile |
| `http://localhost:3000/user.html?u=USERNAME` | Public user page |

---

## 🧪 Testing

The project includes a comprehensive API test suite with **53 tests** covering:

- ✅ Authentication (signup, login, JWT validation)
- ✅ Profile management (CRUD, validation)
- ✅ Anonymous question sending (validation, rate limiting)
- ✅ Question lifecycle (answer, ignore, update, delete)
- ✅ Access control (cross-user protection)
- ✅ Global & per-user feeds (pagination, filtering)
- ✅ Private answer visibility
- ✅ Edge cases (404s, malformed JWTs)

```bash
npm run test:api
```

---

## 📄 License

This project is for educational purposes.

---

> Built with ❤️ as part of the ITI Node.js curriculum
