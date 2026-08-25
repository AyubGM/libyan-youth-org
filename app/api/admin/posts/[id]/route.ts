import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';
//import { logActivity } from '@/lib/activity-log';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: { category: true, author: { select: { name: true } } },
  });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: body,
  });

//   await logActivity({
//     adminId: admin.adminId,
//     action: 'POST_UPDATED',
//     entityType: 'POST',
//     entityId: post.id,
//     details: `Updated post "${post.title}"`,
//   });

  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const post = await prisma.post.delete({ where: { id: Number(id) } });

//   await logActivity({
//     adminId: admin.adminId,
//     action: 'POST_DELETED',
//     entityType: 'POST',
//     entityId: Number(id),
//     details: `Deleted post "${post.title}"`,
//   });

  return NextResponse.json({ success: true });
}