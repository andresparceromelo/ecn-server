import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = 'abedoya923@soyudemedellin.edu.co';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`ℹ️  El admin ${email} ya existe`);
    return;
  }

  const password = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: { name: 'Admin ECN', email, password, role: UserRole.ADMIN },
  });

  console.log(`✅ Admin creado: ${admin.email} (ID: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
