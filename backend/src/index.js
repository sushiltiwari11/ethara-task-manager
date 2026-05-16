const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// 1. Live Request Logger (Isse Render logs me har ek incoming request saaf dikhegi)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request received at: ${req.url}`);
  next();
});

// 2. Helmet (Cross-Origin Policy ko allow kiya taaki API block na ho)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. Bulletproof CORS Setup
const allowedOrigin = 'https://ethara-task-manager-nine.vercel.app';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

// 6. Global Error Handler (With Explicit CORS Fallback Headers)
app.use((err, req, res, next) => {
  console.error("❌ Backend Error Caught:", err.message || err);
  
  // Agar code crash bhi ho, tab bhi CORS header jana chahiye taaki asli error dikhe
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

// Render hamesha port 10000 prefer karta hai
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running successfully on port ${PORT}`));