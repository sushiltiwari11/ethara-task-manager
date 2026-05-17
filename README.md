
# 🚀 Ethara Task Manager

Ethara Task Manager is a production-ready, high-performance Full-Stack Project and Task Management Application. It allows teams to create projects, assign tasks, track progress dynamically using an interactive Kanban board, and monitor productivity metrics with live dashboard analytics.

## 🔗 Live Links
- **Live Frontend (Vercel):** [https://ethara-task-manager-nine.vercel.app](https://ethara-task-manager-nine.vercel.app)
- **Live Backend (Railway):** [https://ethara-task-manager-production-4511.up.railway.app](https://ethara-task-manager-production-4511.up.railway.app)

---

## ✨ Key Features

- **🔐 Secure Authentication:** Robust Signup and Login system using JSON Web Tokens (JWT) and secure cookie/local storage token management.
- **📋 Interactive Kanban Board:** Drag-and-drop task workflow management (`To Do`, `In Progress`, `Done`) powered by `@hello-pangea/dnd` with lightning-fast optimistic UI updates.
- **📊 Advanced Analytics Dashboard:** Comprehensive productivity insights featuring interactive charts (Bar Charts and Pie Charts via `Recharts`) displaying task breakdowns and project progress.
- **🚨 Overdue Task Alert System:** Built-in date-checking algorithm that highlights past-deadline tasks on the dashboard with real-time warning indicators.
- **🛡️ Role-Based Access Control (RBAC):** Configured for structural workspace integrity separating `Admin` and `Member` privileges.
- **⚡ Performance Optimized:** Zero API waterfalls on the dashboard using concurrent request pooling (`Promise.all`), leading to sub-second load times.
- **🎨 Modern Visuals:** Clean UI utilizing Tailwind CSS with a strict, distraction-free Light Theme custom-built for high-focus project environments.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS
- Recharts (Data Visualization)
- @hello-pangea/dnd (Drag and Drop Framework)
- Axios (API Client)

**Backend:**
- Node.js & Express.js
- Prisma ORM
- MongoDB (NoSQL Database)
- JWT (JsonWebToken) for Authentication

**Deployment:**
- Frontend: **Vercel**
- Backend: **Railway** (Production Containers)

---

## ⚙️ Installation & Setup (Local)

Follow these steps to run the project locally:

### 1. Clone the repository
```bash
git clone [https://github.com/sushiltiwari11/ethara-task-manager.git](https://github.com/sushiltiwari11/ethara-task-manager.git)
cd ethara-task-manager

```

### 2. Setup Backend Environment Variables

Create a `.env` file inside your backend directory:

```env
DATABASE_URL="your-mongodb-connection-string"
JWT_SECRET="your-super-secret-key"
PORT=8080

```

### 3. Run the Backend

```bash
cd backend
npm install
npx prisma generate
npm run dev

```

### 4. Setup Frontend Environment Variables

Create a `.env` file inside your frontend directory:

```env
VITE_API_URL="http://localhost:8080/api"

```

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev

```

---

## 👥 Authors & Acknowledgments

* Developed by **Sushil Tiwari** - Built as a part of a specialized full-stack assessment submission.

```

```