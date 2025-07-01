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

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/lms";
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes with rate limiting
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/video-calls", videoCallRoutes);
app.use("/api/friends", friendRoutes);

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
    mongoose.connection.close();
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));