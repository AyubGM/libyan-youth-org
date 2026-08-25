import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';
import { postCreateSchema } from '@/lib/validation';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as any;
  const search = searchParams.get('search') || '';

  const posts = await prisma.post.findMany({
    where: {
      ...(status && { status }),
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
    },
    orderBy: { publishedAt: 'desc' },
    include: { category: true, author: { select: { name: true } } },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = postCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      ...parsed.data,
      authorId: admin.adminId,
    },
  });

//   await logActivity({
//     adminId: admin.adminId,
//     action: 'POST_CREATED',
//     entityType: 'POST',
//     entityId: post.id,
//     details: `Created post "${post.title}"`,
//   });

  return NextResponse.json(post, { status: 201 });
}