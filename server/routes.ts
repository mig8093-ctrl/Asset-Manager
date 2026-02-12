import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // ✅ اختبار اتصال قاعدة البيانات
  app.get("/api/health", async (_req, res) => {
    try {
      await db.execute(sql`select 1`);
      res.json({ ok: true, db: "connected" });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e?.message });
    }
  });

  // ✅ إنشاء مستخدم (تجربة)
  app.post("/api/users", async (req, res) => {
    try {
      const { username, password } = req.body ?? {};

      if (!username || !password) {
        return res.status(400).json({ message: "username and password are required" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(409).json({ message: "username already exists" });

      const user = await storage.createUser({ username, password });
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ message: "error", error: e?.message });
    }
  });

  // ✅ جلب مستخدم حسب username (تجربة)
  app.get("/api/users/by-username/:username", async (req, res) => {
    const user = await storage.getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ message: "not found" });
    res.json(user);
  });

  const httpServer = createServer(app);
  return httpServer;
}
