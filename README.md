<div align="center">

# 💬 ChatApp

**A modern, secure, and feature-rich real-time chat application**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[🚀 Live Demo](https://chat-app-x08.vercel.app/) • [📖 Documentation](#api-documentation) • [🐛 Report Bug](https://github.com/koustavx08/chat-app/issues/new?labels=bug&template=bug_report.md) • [✨ Request Feature](https://github.com/koustavx08/chat-app/issues/new?labels=enhancement&template=feature_request.md)

</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      
### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **End-to-end encryption** for message privacy
- **Profile management** with avatar uploads
- **Session management** with automatic logout

### 💬 Messaging System
- **Real-time messaging** with Socket.IO
- **Private conversations** between users
- **Group chats** with multiple participants
- **Media sharing** (images, videos, documents)
- **Message reactions** and emoji support

    </td>
    <td width="50%">
      
### ⚡ Real-time Features
- **Typing indicators** to show active typing
- **Message delivery receipts** and read status
- **Online/offline status** indicators
- **Push notifications** for new messages

### 🎨 User Experience
- **Dark/Light theme** toggle
- **Responsive design** for all devices
- **Message search** with pagination
- **Media preview** and download
- **Smooth animations** with Framer Motion

    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

</div>

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) 📦
- **MongoDB** (local or cloud instance) 🍃
- **Git** for version control 🔧

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/koustavx08/chat-app.git
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (frontend + backend)
   npm run install:all
   
   # Or install separately
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Environment Setup**
   ```bash
   # Create environment file in backend directory
   cd backend
   cp .env.example .env
   
   # Edit .env with your configuration
   # Required variables:
   # - MONGODB_URI
   # - JWT_SECRET
   # - PORT
   ```

4. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately
   # Backend (from root directory)
   cd backend && npm run dev
   
   # Frontend (from root directory)
   cd frontend && npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

---

## 📁 Project Architecture

```
chat-app/
├── 🎨 frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route components
│   │   ├── stores/       # Zustand state management
│   │   ├── lib/          # Utilities and API clients
│   │   └── types/        # TypeScript type definitions
│   └── public/           # Static assets
│
├── ⚙️ backend/           # Node.js Express backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API route definitions
│   │   ├── middleware/   # Custom middleware
│   │   ├── utils/        # Helper functions
│   │   └── config/       # Configuration files
│   └── uploads/          # File upload storage
│
└── 📄 docs/             # Documentation files
```

---

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `GET` | `/api/auth/profile` | Get user profile | ✅ |
| `PUT` | `/api/auth/profile` | Update profile | ✅ |

### 💬 Message Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/messages/:conversationId` | Get conversation messages | ✅ |
| `POST` | `/api/messages` | Send new message | ✅ |
| `DELETE` | `/api/messages/:messageId` | Delete message | ✅ |
| `PUT` | `/api/messages/:messageId/read` | Mark as read | ✅ |

### 🗨️ Conversation Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/conversations` | Get user conversations | ✅ |
| `POST` | `/api/conversations` | Create conversation | ✅ |
| `GET` | `/api/conversations/:id` | Get specific conversation | ✅ |
| `DELETE` | `/api/conversations/:id` | Delete conversation | ✅ |

---

## 🔌 Socket Events

### Client → Server Events
| Event | Description | Payload |
|-------|-------------|---------|
| `join_conversation` | Join a conversation room | `{ conversationId }` |
| `send_message` | Send a new message | `{ conversationId, content, type }` |
| `typing_start` | Start typing indicator | `{ conversationId }` |
| `typing_stop` | Stop typing indicator | `{ conversationId }` |

### Server → Client Events
| Event | Description | Payload |
|-------|-------------|---------|
| `new_message` | New message received | `{ message, conversation }` |
| `message_delivered` | Message delivery confirmation | `{ messageId }` |
| `message_read` | Message read confirmation | `{ messageId, readBy }` |
| `user_typing` | User typing notification | `{ userId, conversationId }` |
| `user_online` | User online status | `{ userId, status }` |

---

## 🎨 Screenshots

<div align="center">

### 🌙 Dark Mode
<img src="https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Dark+Mode+Chat+Interface" alt="Dark Mode" />

### ☀️ Light Mode
<img src="https://via.placeholder.com/800x400/ffffff/000000?text=Light+Mode+Chat+Interface" alt="Light Mode" />

</div>

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Koustav Singh](https://github.com/koustavx08)

[⬆ Back to Top](#-chatapp)

</div>