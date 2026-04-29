import admin from "firebase-admin";
import type { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

if (!admin.apps.length) {
  admin.initializeApp();
}

export const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split("Bearer ")[1]
    : null;

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    console.error("Firebase Verification Error:", error.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
