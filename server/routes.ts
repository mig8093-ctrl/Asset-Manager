import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { storage } from "./storage";
import { OAuth2Client } from "google-auth-library";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

  // ✅ Google Login: يستقبل idToken من Expo ويرجع user + profileCompleted
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { idToken } = req.body ?? {};
      if (!idToken) return res.status(400).json({ message: "idToken is required" });

      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ message: "GOOGLE_CLIENT_ID is missing on server" });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const p = ticket.getPayload();
      if (!p) return res.status(401).json({ message: "invalid token" });

      const googleId = p.sub;
      const email = p.email ?? null;
      const name = p.name ?? null;
      const avatarUrl = p.picture ?? null;

      // ابحث عن المستخدم بواسطة googleId
      const found = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);

      let user = found[0];
      if (!user) {
        // أول مرة: أنشئ user
        const created = await db
          .insert(users)
          .values({
            username: email ?? `google:${googleId}`,
            password: null,
            googleId,
            email,
            name,
            avatarUrl,
            profileCompleted: false,
          })
          .returning();
        user = created[0];
      } else {
        // تحديث بيانات بسيطة لو تغيّرت
        await db
          .update(users)
          .set({
            email: email ?? user.email,
            name: name ?? user.name,
            avatarUrl: avatarUrl ?? user.avatarUrl,
          })
          .where(eq(users.id, user.id));
      }

      res.json({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          profileCompleted: user.profileCompleted,
        },
      });
    } catch (e: any) {
      res.status(500).json({ message: "auth failed", error: e?.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
