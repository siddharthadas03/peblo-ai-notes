# AI Notes Workspace

A production-ready full-stack SaaS-style notes workspace with JWT authentication, MongoDB persistence, public sharing, analytics, and Google Gemini-powered note summaries.

## Features

- Signup, login, persistent JWT sessions, and protected frontend routes
- Notes CRUD with autosave, archive toggle, categories, and tags
- Keyword search, tag filtering, archive filtering, and latest/oldest sorting
- Gemini AI summaries with action items and suggested titles
- Public read-only share links for individual notes
- Dashboard with totals, recent notes, most-used tags, AI usage count, and weekly activity chart
- Markdown editor with sanitized preview
- Dark mode, responsive layout, toast notifications, empty states, and confirmation modals

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Context API, Recharts  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs  
**AI:** Google Gemini API

## File Structure

```txt
.
├── backend
│   ├── src
│   │   ├── app.js
│   │   ├── config/db.js
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── pages
│   │   └── services
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json
└── README.md
```

## Installation

```bash
npm run install:all
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

You can also run each app separately:

```bash
npm install --prefix backend
npm run dev --prefix backend
npm install --prefix frontend
npm run dev --prefix frontend
```

## Environment Variables

Backend `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-notes-workspace
JWT_SECRET=replace_with_a_long_random_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

For local development, the backend falls back to `PORT=5000`, a local MongoDB database, and a dev-only JWT secret. Set real values for production.

Frontend `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Documentation

All protected routes require:

```http
Authorization: Bearer <jwt>
```

### Auth

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create account |
| `POST` | `/api/auth/login` | Log in |
| `GET` | `/api/auth/me` | Get current user |

### Notes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/notes` | List notes |
| `POST` | `/api/notes` | Create note |
| `GET` | `/api/notes/:id` | Get note |
| `PUT` | `/api/notes/:id` | Update note |
| `DELETE` | `/api/notes/:id` | Delete note |
| `PATCH` | `/api/notes/:id/share` | Toggle public/private |
| `POST` | `/api/notes/:id/ai-summary` | Generate Gemini summary |
| `GET` | `/api/notes/dashboard` | Dashboard analytics |

Supported note list query params:

```txt
search=keyword
tag=tagName
archived=true|false
category=categoryName
sort=latest|oldest
```

### Public

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/shared/:shareId` | Public read-only note |

Frontend shared route:

```txt
/shared/:shareId
```

## Deployment

### Backend on Render

1. Create a new Web Service from your repository.
2. Set root directory to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, and optionally `CLIENT_URL`.
6. Use a production MongoDB Atlas connection string for `MONGO_URI`.

### Frontend on Vercel

1. Import the repository into Vercel.
2. Set root directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_URL=https://your-render-service.onrender.com/api`.

## Notes

- Do not commit real `.env` files or secrets.
- The Gemini service uses `gemini-2.5-flash` through the official `generateContent` REST endpoint with JSON output configuration.
- Public notes expose only read-only fields and require `isPublic=true`.
