import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

export const memberRegisterSchema = z.object({
  firstName: z.string().min(1).max(100),
  secondName: z.string().min(1).max(100),
  thirdName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  nationalId: z.string().min(1).max(50),
  dateOfBirth: z.coerce.date(),
  city: z.string().min(1),
  education: z.enum(['PRIMARY', 'PREPARATORY', 'SECONDARY', 'BACHELOR', 'MASTER', 'PHD', 'VOCATIONAL']),
  phone: z.string().min(1),
  email: z.email(),
  specialty: z.string().min(1),
  membershipType: z.enum(['ACTIVE', 'VOLUNTEER', 'SUPPORTER']),
  personalPhoto: z.string(),
  idDocument: z.string(),
})

export const postCreateSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.number().int().positive(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isFeatured: z.boolean().optional(),
})

export const memberStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
})

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
})

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  subject: z.string().min(1),
  message: z.string().min(1),
})