import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "criadora@mimelux.com.br" },
    update: {},
    create: {
      email: "criadora@mimelux.com.br",
      passwordHash: "DEMO_ONLY_NOT_A_REAL_PASSWORD_HASH",
      role: "CREATOR",
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          name: "Luna Ferraz",
          username: "lunaferraz",
          bio: "Lifestyle, café e pôr do sol em SP.",
          city: "São Paulo, SP",
          avatarUrl: "/media/generated/creator-luna-ferraz-avatar.jpg",
          coverUrl: "/media/generated/creator-luna-ferraz-cover.jpg",
        },
      },
      creator: {
        create: {
          status: "ACTIVE",
          category: "Lifestyle",
          aiGenerated: true,
          fictitious: true,
        },
      },
    },
    include: { creator: true },
  });

  if (!user.creator) return;

  const existingPlan = await prisma.plan.findFirst({
    where: { creatorId: user.creator.id, name: "Mensal" },
  });
  if (!existingPlan) {
    await prisma.plan.create({
      data: {
        creatorId: user.creator.id,
        name: "Mensal",
        description: "Plano mensal de demonstração.",
        priceCents: 2990,
        durationMonths: 1,
      },
    });
  }
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
