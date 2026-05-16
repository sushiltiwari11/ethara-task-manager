const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// 1. Live Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request received at: ${req.url}`);
  next();
});

// 2. Helmet Configuration (CORS friendly)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. Dynamic CORS Setup (Ab localhost ho ya vercel, sab par bina jhanjhat chalega)
app.use(cors({
  origin: (origin, callback) => {
    // Yeh automatic har incoming origin ko allow karega aur credentials bhee support karega
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 204
}));

// 4. Body Parser
app.use(express.json());

// 5. App Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 6. Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Backend Error Caught:", err.message || err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running successfully on port ${PORT}`));