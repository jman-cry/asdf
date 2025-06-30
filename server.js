const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const projectRoutes = require("./routes/projects");
const videoCallRoutes = require("./routes/videoCalls");
const friendRoutes = require("./routes/friends");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(fileUpload());
app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://omer1999remo:rxTaeHTHYRwQh8ds@lms.7gzqteb.mongodb.net/lms",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/video-calls", videoCallRoutes);
app.use("/api/friends", friendRoutes);

// Socket.IO for WebRTC signaling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-call", ({ callId, userId }) => {
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
