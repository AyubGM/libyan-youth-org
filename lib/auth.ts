import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not configured");
}

export type AdminTokenPayload = {
  adminId: number
  email: string
  name: string
};

export function signToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '7d' })
}

export function verifyToken(token: string): AdminTokenPayload {
  return jwt.verify(token, JWT_SECRET as string) as AdminTokenPayload
}

export function getAdminFromRequest(req: NextRequest): AdminTokenPayload | null {
  const token = req.cookies.get('admin-token')?.value 
    || req.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) return null
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export function requireAdmin(req: NextRequest): AdminTokenPayload {
  const admin = getAdminFromRequest(req)
  if (!admin) throw new Error('Unauthorized')
  return admin
}