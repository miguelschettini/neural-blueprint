import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "neural-blueprint-jwt-secret-2026";

export const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.userId = decoded.userId;
    } catch (err) {
      // Token invalid or expired
    }
  }
  next();
};
