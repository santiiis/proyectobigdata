import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando creación de usuarios por defecto...");

  const passwordHash = await bcrypt.hash("123456", 10);

  const users = [
    {
      email: "admin@universidad.edu",
      name: "Administrador Global",
      role: "ADMIN",
      password: passwordHash,
      isActive: true,
    },
    {
      email: "director@universidad.edu",
      name: "Director Académico",
      role: "DIRECTOR",
      password: passwordHash,
      isActive: true,
    },
    {
      email: "tutor@universidad.edu",
      name: "Tutor Estudiantil",
      role: "TUTOR",
      password: passwordHash,
      isActive: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        role: user.role as any,
        password: user.password,
        isActive: user.isActive,
      },
    });
    console.log(`✅ Usuario creado: ${user.email} (Rol: ${user.role})`);
  }

  console.log("¡Usuarios creados con éxito! La contraseña para todos es: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
