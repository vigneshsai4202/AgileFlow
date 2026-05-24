# AgileFlow Backend

REST API for AgileFlow — built with Node.js, Express, MongoDB, and JWT.

## Quick Start

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev
```

## Environment Variables

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/agileflow
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

## API Reference

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |

### Projects
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/projects` | ✅ | Get user's projects |
| POST | `/api/projects` | ✅ | Create project |
| GET | `/api/projects/:id` | ✅ | Get project by ID |
| PUT | `/api/projects/:id` | ✅ | Update project (owner only) |
| DELETE | `/api/projects/:id` | ✅ | Delete project + tasks (owner only) |

### Tasks
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/tasks/project/:projectId` | ✅ | Get tasks for a project |
| POST | `/api/tasks` | ✅ | Create task |
| PUT | `/api/tasks/:id` | ✅ | Update task |
| DELETE | `/api/tasks/:id` | ✅ | Delete task |

## Deploy on Render

1. Push to GitHub
2. New Web Service → connect repo
3. Build: `npm install` | Start: `node server.js`
4. Add env vars: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`
