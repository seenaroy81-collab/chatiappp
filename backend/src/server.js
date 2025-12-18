import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const PORT = ENV.PORT || 3000;

/* =========================
   GLOBAL MIDDLEWARE
========================= */

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// ✅ CORS — FINAL FIX (Render ↔ Vercel ↔ Local)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman / server calls

      const allowedOrigins = [
        "http://localhost:5173",     // local frontend
        ENV.CLIENT_URL,              // vercel frontend
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ VERY IMPORTANT: preflight
app.options("*", cors());

/* =========================
   ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Health check (Render)
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

/* =========================
   START SERVER
========================= */

server.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await connectDB();
});
