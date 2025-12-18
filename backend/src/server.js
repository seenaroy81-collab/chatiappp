import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();
const PORT = ENV.PORT || 3000;

/* =========================
   GLOBAL MIDDLEWARE
========================= */

// Parse JSON body
app.use(express.json({ limit: "5mb" }));

// ✅ CORS — FIXED FOR VERCEL + LOCAL
app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman / server-to-server
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173",        // local dev
        ENV.CLIENT_URL,                // Vercel frontend
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ REQUIRED for preflight requests
app.options("*", cors());

// Cookies
app.use(cookieParser());

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

/* =========================
   HEALTH CHECK (OPTIONAL)
========================= */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Backend running 🚀" });
});

/* =========================
   START SERVER
========================= */
server.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await connectDB();
});
