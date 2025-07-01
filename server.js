const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const projectRoutes = require("./routes/projects");
const videoCallRoutes = require("./routes/videoCalls");
const friendRoutes = require("./routes/friends");
const teacherRoutes = require("./routes/teachers");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  } 
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 auth requests per windowMs
  skipSuccessfulRequests: true
});

app.use(express.json({ limit: '10mb' }));
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max file size
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Ensure upload directories exist
const uploadDirs = ['uploads/videos', 'uploads/pdfs'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use("/uploads", express.static("uploads"));

// MongoDB connection with graceful error handling
let isMongoConnected = false;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/lms";
    
    // Set connection timeout to fail faster
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000,
    });
    
    console.log("✅ MongoDB connected successfully");
    isMongoConnected = true;
  } catch (error) {
    console.warn("⚠️  MongoDB connection failed:", error.message);
    console.log("📝 The server will continue running without database functionality.");
    console.log("💡 To fix this:");
    console.log("   1. Set up a MongoDB database (e.g., MongoDB Atlas)");
    console.log("   2. Set the MONGODB_URI environment variable");
    console.log("   3. Restart the server");
    isMongoConnected = false;
  }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
  isMongoConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isMongoConnected = false;
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
  isMongoConnected = true;
});

// Middleware to check database connection
const checkDBConnection = (req, res, next) => {
  if (!isMongoConnected) {
    return res.status(503).json({ 
      message: 'Database not available. Please configure MongoDB connection.',
      error: 'DATABASE_UNAVAILABLE'
    });
  }
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isMongoConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes with database connection check
app.use("/api/auth", authLimiter, checkDBConnection, authRoutes);
app.use("/api/courses", checkDBConnection, courseRoutes);
app.use("/api/projects", checkDBConnection, projectRoutes);
app.use("/api/video-calls", checkDBConnection, videoCallRoutes);
app.use("/api/friends", checkDBConnection, friendRoutes);
app.use("/api/teachers", checkDBConnection, teacherRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'File too large' });
  }
  
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Socket.IO for WebRTC signaling with authentication
const socketAuth = require('./middleware/socketAuth');

io.use(socketAuth);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "User ID:", socket.userId);

  socket.on("join-call", ({ callId, userId }) => {
    // Verify user is authorized for this call
    if (socket.userId !== userId) {
      socket.emit("error", "Unauthorized");
      return;
    }
    
    socket.join(callId);
    socket.to(callId).emit("user-joined", userId);
  });

  socket.on("offer", ({ callId, offer }) => {
    socket.to(callId).emit("offer", offer);
  });

  socket.on("answer", ({ callId, answer }) => {
    socket.to(callId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ callId, candidate }) => {
    socket.to(callId).emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    if (isMongoConnected) {
      mongoose.connection.close();
    }
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
});