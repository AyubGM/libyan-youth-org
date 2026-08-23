import { NextRequest } from "next/server";
import { SignJWT, jwtVerify, JWTPayload } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
)

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not configured");
}

export interface AdminTokenPayload extends JWTPayload {
  adminId: number
  email: string
  name: string
}

export async function signToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<AdminTokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload as AdminTokenPayload
}

export async function getAdminFromRequest(req: NextRequest): Promise<AdminTokenPayload | null> {
  const token = req.cookies.get('admin-token')?.value 
    || req.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function requireAdmin(req: NextRequest): Promise<AdminTokenPayload> {
  const admin = await getAdminFromRequest(req)
  if (!admin) throw new Error('Unauthorized')
  return admin
}