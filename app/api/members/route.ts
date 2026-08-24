import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { memberRegisterSchema } from "@/lib/validation";
import { saveFile } from "@/lib/upload";
import { sendEmail } from "@/lib/mail";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const raw = {
      firstName: formData.get("firstName") as string,
      secondName: formData.get("secondName") as string,
      thirdName: formData.get("thirdName") as string,
      lastName: formData.get("lastName") as string,
      nationalId: formData.get("nationalId") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      city: formData.get("city") as string,
      education: formData.get("education") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      specialty: formData.get("specialty") as string,
      membershipType: formData.get("membershipType") as string,
      personalPhoto: "",
      idDocument: "",
    };

    // 2. Check for duplicate national ID early (before schema validation / disk writes)
    const existing = await prisma.member.findUnique({
      where: { nationalId: String(raw.nationalId) },
    });
    if (existing) {
      return NextResponse.json(
        { error: "National ID already registered" },
        { status: 409 },
      );
    }

    // 3. Extract Files
    const personalPhoto = formData.get("personalPhoto") as File | null;
    const idDocument = formData.get("idDocument") as File | null;

    let personalPhotoPath = "";
    let idDocumentPath = "";

    // 4. Save files AFTER checking duplicates
    if (personalPhoto && personalPhoto.size > 0) {
      personalPhotoPath = await saveFile(personalPhoto, "photos");
    }
    if (idDocument && idDocument.size > 0) {
      idDocumentPath = await saveFile(idDocument, "documents");
    }

    // 5. Parse schema with final file paths
    const data = memberRegisterSchema.parse({
      ...raw,
      personalPhoto: personalPhotoPath,
      idDocument: idDocumentPath,
      dateOfBirth: new Date(raw.dateOfBirth as string),
    });

    const member = await prisma.member.create({ data });

    try {
      await sendEmail({
        to: member.email,
        subject: "تم استلام طلب العضوية - المؤسسة الليبية للشباب",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif;">
            <h2>مرحباً ${member.firstName} ${member.lastName}</h2>
            <p>تم استلام طلب العضوية بنجاح.</p>
            <p>رقم الطلب: <strong>${member.id}</strong></p>
            <p>الحالة: قيد المراجعة</p>
            <p>سنخبرك فور الموافقة.</p>
            <br>
            <p>مع تحيات،<br>المؤسسة الليبية للشباب</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
      // Member is created, so continue returning success
    }

    return NextResponse.json(
      { success: true, memberId: member.id },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Member Registration Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
