import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';
import { memberStatusSchema } from '@/lib/validation';


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = memberStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const member = await prisma.member.update({
    where: { id: Number(id) },
    data: {
      status: parsed.data.status,
      approvedAt: parsed.data.status === 'APPROVED' ? new Date() : null,
      approvedById: parsed.data.status === 'APPROVED' ? admin.adminId : null,
    },
  });

//   await logActivity({
//     adminId: admin.adminId,
//     action: `MEMBER_${parsed.data.status}`,
//     entityType: 'MEMBER',
//     entityId: member.id,
//     details: `Member ${member.firstName} ${member.lastName} was ${parsed.data.status.toLowerCase()}`,
//   });

  return NextResponse.json(member);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const member = await prisma.member.delete({ where: { id: Number(id) } });

//   await logActivity({
//     adminId: admin.adminId,
//     action: 'MEMBER_DELETED',
//     entityType: 'MEMBER',
//     entityId: Number(id),
//     details: `Deleted member ${member.firstName} ${member.lastName}`,
//   });

  return NextResponse.json({ success: true });
}