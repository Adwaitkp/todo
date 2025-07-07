# Real-Time Collaborative To-Do Board

A fullstack web application for managing tasks collaboratively in real time. Built with React, Vite, Tailwind CSS (frontend), and Node.js, Express, MongoDB, Socket.IO (backend).

## Features
- Real-time updates for all users (Socket.IO)
- User authentication (JWT)
- Create, update, delete, and assign tasks
- Smart assignment of tasks to users
- Activity log of all actions
- Responsive, modern UI (Tailwind CSS)
- Conflict resolution for concurrent edits

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Socket.IO-client
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB instance (local or cloud)

### 1. Clone the repository
```bash
git clone <repo-url>
cd todo
```

### 2. Backend Setup
```bash
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in `backend/`:
```
MONGO_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=your_jwt_secret
PORT=5000 # optional, defaults to 5000
```

#### Start the backend server
```bash
npm run dev   # for development (nodemon)
# or
npm start     # for production
```
The backend runs on [http://localhost:5000](http://localhost:5000) by default.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

#### Start the frontend dev server
```bash
npm run dev
```
The frontend runs on [http://localhost:5173](http://localhost:5173) by default.

---

## Project Structure

```
todo/
  backend/    # Express API, MongoDB models, Socket.IO
  frontend/   # React app, Tailwind CSS, Vite
```

---

## API Overview

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT

### Tasks
- `GET /api/tasks` — List all tasks
- `POST /api/tasks` — Create task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task
- `POST /api/tasks/:id/smart-assign` — Smart assign task to user

### Actions
- `GET /api/actions` — Get last 20 actions (activity log)

### Users
- `GET /api/users` — List all users

---

## Data Models (Backend)

### User
- `username` (String, unique, required)
- `password` (String, hashed, required)
- `createdAt` (Date)

### Task
- `title` (String, unique, required)
- `description` (String)
- `assignedUser` (User reference)
- `status` ("Todo" | "In Progress" | "Done")
- `priority` (Number, 1-5)
- `updatedAt`, `createdAt` (Date)

### ActionLog
- `user` (User reference)
- `action` (String: create, update, delete, smart-assign)
- `task` (Task reference)
- `details` (String)
- `timestamp` (Date)

---

## Frontend Overview
- **`src/components/Board.jsx`**: Main Kanban board, drag-and-drop, task CRUD, smart assign, real-time updates
- **`src/components/TaskCard.jsx`**: Task display and edit UI
- **`src/components/AuthForm.jsx`**: Login/register form
- **`src/components/ActivityLog.jsx`**: Real-time activity feed
- **`src/components/ConflictModal.jsx`**: Handles edit conflicts
- **`src/utils/api.js`**: API calls to backend
- **`src/utils/socket.js`**: Socket.IO client setup
- **`src/utils/auth.js`**: Token management

---

## Usage Notes
- Make sure the backend is running before starting the frontend.
- Update API URLs in the frontend if running backend on a different port or host (see `VITE_API_URL` in frontend).
- All task and action routes require a valid JWT (login first).
- Smart assign will assign the task to the user with the fewest active tasks.
- Activity log shows the last 20 actions in real time.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE) 