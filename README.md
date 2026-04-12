# 🎓 EduAdmin – School Management System

A full-stack web application built with the **MERN Stack** to manage core school operations including student enrollment and task/assignment management.

> Built as part of the **Gridaan Full Stack Developer Technical Assignment**

---

## 🌐 Live Demo

- **Frontend:** https://schoolmanagmet1.vercel.app
- **Backend API:** https://school-management-api-bptr.onrender.com
- **GitHub:** https://github.com/Uditdev1/School_management

---

## 🔑 Default Login Credentials

```
Email:    admin@school.com
Password: Admin@123
```

---

## ✅ Features Implemented

### 🔐 Authentication
- Secure admin login with JWT-based authentication
- Protected routes — only logged-in admin can access dashboard
- Token persisted in localStorage with auto-restore on page refresh
- Logout clears session completely

### 👨‍🎓 Student Management
- Add new students with full profile (name, class, section, roll number, gender, date of birth, contact info, parent name, address)
- Edit existing student details
- Delete students (automatically removes all their assigned tasks)
- Search by name, roll number, or class
- Filter by class, section, and status (Active / Inactive)
- Pagination (10 records per page)

### 📋 Task & Assignment Management
- Assign tasks/homework to specific students
- Set subject, due date, and priority (Low / Medium / High)
- One-click task completion toggle (✅ checkbox)
- Full status lifecycle: Pending → In Progress → Completed
- Overdue task highlighting in red
- Filter by status, priority, or student
- Pagination (10 records per page)

### 📊 Dashboard
- Live stats: total students, total tasks, completion rate, overdue count
- Task completion progress bar
- Students by class distribution chart
- Task priority breakdown chart
- Recent students and recent tasks activity feed

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Date Utilities | date-fns |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + bcryptjs |
| Security | Helmet.js + CORS |
| Dev Server | Nodemon |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## 📁 Project Structure

```
School_Managment/
│
├── client/                          # ⚛️ React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmDialog.jsx    # Delete confirmation modal
│   │   │   ├── Layout.jsx           # Sidebar + topbar shell
│   │   │   └── Modal.jsx            # Reusable modal component
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global authentication state
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Stats and overview page
│   │   │   ├── Login.jsx            # Admin login page
│   │   │   ├── Students.jsx         # Student CRUD management
│   │   │   └── Tasks.jsx            # Task/assignment management
│   │   ├── utils/
│   │   │   └── api.js               # Axios instance with JWT interceptor
│   │   ├── App.jsx                  # Routes + protected routes
│   │   ├── index.css                # Global design system + CSS variables
│   │   └── main.jsx                 # React entry point
│   ├── index.html
│   ├── vercel.json                  # Vercel SPA routing config
│   ├── package.json
│   └── vite.config.js               # Vite dev server with API proxy
│
└── js/
    └── server/                      # 🟢 Node.js Backend
        ├── middleware/
        │   └── auth.js              # JWT protect middleware
        ├── models/
        │   ├── Student.js           # Student Mongoose schema
        │   ├── Task.js              # Task Mongoose schema
        │   └── User.js              # Admin user schema + bcrypt
        ├── routes/
        │   ├── auth.js              # Login / logout / me / change-password
        │   ├── dashboard.js         # Stats and analytics aggregation
        │   ├── students.js          # Student CRUD API routes
        │   └── tasks.js             # Task CRUD API routes
        ├── index.js                 # Express app entry point
        ├── package.json
        └── .env                     # Environment configuration
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Git

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Uditdev1/School_management.git
cd School_management
```

---

### Step 2 — Setup Backend

```bash
cd js/server
npm install
```

Create `.env` file inside `js/server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=school_super_secret_jwt_key_2024_gridaan
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> Replace `MONGO_URI` with your MongoDB Atlas connection string.
> Go to MongoDB Atlas → Connect → Drivers → Copy connection string → Replace `<password>` with your actual password.

Start the backend:

```bash
npm run dev
```

You should see:
```
MongoDB Connected
✅ Admin created → admin@school.com / Admin@123
Server running on port 5000
```

---

### Step 3 — Setup Frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

---

### Step 4 — Open in Browser

```
http://localhost:5173
```

Login with:
```
Email:    admin@school.com
Password: Admin@123
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Admin login |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/auth/logout` | ✅ | Logout |
| POST | `/api/auth/change-password` | ✅ | Change password |

### Students
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/students` | ✅ | List all students (search, filter, paginate) |
| GET | `/api/students/:id` | ✅ | Get single student |
| POST | `/api/students` | ✅ | Add new student |
| PUT | `/api/students/:id` | ✅ | Update student |
| DELETE | `/api/students/:id` | ✅ | Delete student + their tasks |
| GET | `/api/students/:id/tasks` | ✅ | Get all tasks for a student |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tasks` | ✅ | List all tasks (search, filter, paginate) |
| GET | `/api/tasks/:id` | ✅ | Get single task |
| POST | `/api/tasks` | ✅ | Create/assign task |
| PUT | `/api/tasks/:id` | ✅ | Update task |
| PATCH | `/api/tasks/:id/status` | ✅ | Quick status update |
| DELETE | `/api/tasks/:id` | ✅ | Delete task |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/stats` | ✅ | Full stats + recent activity |

---

## 🚀 Deployment Guide

### Backend → Render (Free)

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:

| Field | Value |
|-------|-------|
| Root Directory | `js/server` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `node index.js` |

5. Add Environment Variables:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your Atlas connection string |
| `JWT_SECRET` | `school_super_secret_jwt_key_2024_gridaan` |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

6. Click **Create Web Service**

---

### Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **New Project** → Import your repository
3. Configure:

| Field | Value |
|-------|-------|
| Root Directory | `client` |
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. Add Environment Variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com` |

5. Click **Deploy**

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (10 salt rounds)
- JWT tokens expire in **7 days**
- **Helmet.js** sets secure HTTP headers
- CORS restricted to allowed frontend origins only
- Input validation on all POST and PUT routes using **express-validator**
- Protected routes on both frontend (React) and backend (Express)

---

## 📱 Example User Flow

```
1. Admin opens the app → redirected to /login
2. Logs in with admin@school.com / Admin@123
3. Views dashboard with live stats
4. Goes to Students → clicks Add Student
5. Fills in Rahul's details (Class 10, Roll 001)
6. Goes to Tasks → clicks Assign Task
7. Selects Rahul, subject Mathematics, due date, priority High
8. Dashboard updates automatically with new stats
9. Clicks ✅ checkbox when Rahul completes the task
10. Task marked as Completed, completion rate updates
```

---

## 🖥️ Screenshots

| Page | Description |
|------|-------------|
| Login | Professional dark themed login with credentials hint |
| Dashboard | Live stats, progress bars, recent activity |
| Students | Full table with search, filter, add/edit/delete |
| Tasks | Assignment list with priority badges and status toggle |

---

## 👨‍💻 Author

**Udit**
Full Stack Developer

- GitHub: [@Uditdev1](https://github.com/Uditdev1)
- Assignment submitted for **Gridaan** hiring process
- Email: gridaanhiring@gmail.com

---

## 📄 License

MIT License — free to use and modify

---

## 🙏 Acknowledgments

- [MongoDB Atlas](https://www.mongodb.com/atlas) — Free cloud database
- [Render](https://render.com) — Free backend hosting
- [Vercel](https://vercel.com) — Free frontend hosting
- [Lucide React](https://lucide.dev) — Beautiful icons
- [React Hot Toast](https://react-hot-toast.com) — Notifications
