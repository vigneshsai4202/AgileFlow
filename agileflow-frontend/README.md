# AgileFlow — Project Management Dashboard

A modern, production-ready project management dashboard inspired by Jira and Linear. Built with the MERN stack.

![AgileFlow](https://img.shields.io/badge/AgileFlow-v1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)

---

## Features

- **Authentication** — Register, login, JWT-protected routes, bcrypt password hashing
- **Project Management** — Create, view, update, delete projects
- **Task Management** — Create tasks with status, priority, assignee, due date
- **Kanban Board** — Visual 3-column board (Todo / In Progress / Done)
- **Dashboard** — Stats cards, recent projects, recent tasks
- **Responsive UI** — Works on desktop and mobile
- **Toast Notifications** — Success/error feedback on all actions
- **Empty States** — Clean UI when no data exists

---

## Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 + Vite | UI framework |
| Tailwind CSS v3 | Styling |
| React Router DOM v6 | Routing |
| Axios | HTTP client |
| Zustand | State management |
| react-hot-toast | Notifications |
| lucide-react | Icons |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | Server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |

---

## Project Structure

```
agileflow-frontend/
└── src/
    ├── components/
    │   ├── common/        # ProtectedRoute, Modal, Spinner, EmptyState
    │   ├── dashboard/     # StatCard
    │   ├── layout/        # AppLayout, Sidebar, Navbar
    │   ├── projects/      # ProjectCard, ProjectForm
    │   └── tasks/         # TaskCard, TaskForm, KanbanBoard
    ├── pages/             # LoginPage, RegisterPage, DashboardPage, ProjectsPage, ProjectDetailPage, NotFoundPage
    ├── services/          # api.js, authService, projectService, taskService
    ├── store/             # authStore (Zustand + persist)
    └── utils/             # helpers (colors, formatDate, getErrorMessage)

agileflow-backend/
└── server/
    ├── controllers/       # auth, project, task controllers
    ├── routes/            # auth, project, task routes
    ├── models/            # User, Project, Task models
    ├── middleware/         # auth middleware, error handler
    ├── config/            # db connection
    └── utils/             # asyncHandler
```

---

## Installation

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### Frontend Setup

```bash
cd agileflow-frontend
npm install
cp .env.example .env      # set VITE_API_URL
npm run dev
```

### Backend Setup

```bash
cd agileflow-backend
npm install
cp .env.example .env      # set PORT, MONGO_URI, JWT_SECRET
npm run dev
```

---

## Environment Variables

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/agileflow
JWT_SECRET=your_super_secret_key
```

---

## API Routes

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project by ID |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/project/:projectId` | Get tasks by project |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

---

## Deployment

### Frontend → Vercel
1. Push `agileflow-frontend` to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` environment variable to your backend URL
4. Deploy

### Backend → Render
1. Push `agileflow-backend` to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Set environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`
4. Build command: `npm install` | Start command: `node server.js`

### Database → MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist `0.0.0.0/0` for Render deployment
3. Copy connection string to `MONGO_URI`

---

## Screenshots

> _Add screenshots here after deployment_

| Page | Description |
|------|-------------|
| Login | Clean auth screen with gradient background |
| Dashboard | Stats cards + recent projects/tasks |
| Projects | Grid of project cards |
| Project Detail | Kanban board with 3 columns |

---

## License

MIT
