import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as any;
  const search = searchParams.get('search') || '';

  const members = await prisma.member.findMany({
    where: {
      ...(status && { status }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { nationalId: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { registeredAt: 'desc' },
    include: { approvedBy: { select: { name: true } } },
  });

  return NextResponse.json(members);
}