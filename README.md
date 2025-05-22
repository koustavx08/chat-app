# Real-Time Chat Messaging Application

A full-stack chat messaging application built with React, Node.js, Express, Socket.IO, and MongoDB. This application provides real-time messaging capabilities with features like user authentication, private and group messaging, media sharing, and end-to-end encryption.

## Features

- **User Authentication**
  - Registration and login with JWT
  - Profile management
  
- **Messaging**
  - Private one-on-one messaging
  - Group chats
  - Media sharing (images, videos, documents)
  - End-to-end encryption
  
- **Real-time Features**
  - Message delivery and read receipts
  - Typing indicators
  - Online/offline status
  - Push notifications
  
- **Advanced Features**
  - Message search
  - Message pagination
  - Message reactions
  - Media preview

## Tech Stack

- **Frontend**
  - React (Vite)
  - TailwindCSS
  - Socket.IO Client
  
- **Backend**
  - Node.js
  - Express
  - Socket.IO
  - MongoDB
  - JWT for authentication
  - Multer for file uploads

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (or use the provided connection string)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm run install:all
   ```
3. Create a `.env` file in the backend directory (see `.env.example` for required variables)
4. Start the development servers:
   ```
   npm run dev
   ```

## Project Structure

- `/frontend` - React frontend application
- `/backend` - Node.js backend API and Socket.IO server
  - `/controllers` - Request handlers
  - `/models` - MongoDB schemas
  - `/routes` - API routes
  - `/middlewares` - Custom middlewares
  - `/utils` - Utility functions
  - `/uploads` - Directory for uploaded files

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile

### Messages

- `GET /api/messages/:conversationId` - Get messages for a conversation
- `POST /api/messages` - Send a new message
- `DELETE /api/messages/:messageId` - Delete a message

### Conversations

- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations/:conversationId` - Get a specific conversation

## Socket Events

- `connection` - When a user connects
- `disconnect` - When a user disconnects
- `message` - When a message is sent
- `typing` - When a user is typing
- `read` - When a message is read
- `delivered` - When a message is delivered

## License

MIT