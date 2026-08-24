import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  const name = process.env.ADMIN_SEED_NAME;

  if (!email || !password || !name) {
    throw new Error(
      "Missing required seed environment variables (ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD, ADMIN_SEED_NAME).",
    );
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists.");
    return;
  }

  const passwordHash = await hash(password, 12);

  await prisma.admin.create({
    data: { name, email, passwordHash },
  });

  console.log(`Admin created: ${email}`);
  console.log("Change the default password after first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
