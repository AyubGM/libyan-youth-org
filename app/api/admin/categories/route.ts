import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validation';
import { getAdminFromRequest } from '@/lib/auth';
//import { logActivity } from '@/lib/activity-log';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const category = await prisma.category.create({ data: parsed.data });

//   await logActivity({
//     adminId: admin.adminId,
//     action: 'CATEGORY_CREATED',
//     entityType: 'CATEGORY',
//     entityId: category.id,
//   });

  return NextResponse.json(category, { status: 201 });
}