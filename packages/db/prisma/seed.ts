import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const demoPasswordHash =
  "$2b$10$VrD.M82EvcYYKJrnPC0tsua6uUQMdclUMlGAWTYUxR8KOgwL646.a";

const creators = [
  ["Luna Ferraz", "lunaferraz", "lifestyle", "Lifestyle, café e pôr do sol em SP.", "luna-ferraz", "post-01.jpg"],
  ["Bella Monroe", "bellamonroe", "fashion", "Moda autoral e looks do dia.", "bella-monroe", "post-02.jpg"],
  ["Nina Valença", "ninavalenca", "beauty", "Skincare e maquiagem natural.", "nina-valenca", "post-03.jpg"],
  ["Sofia Blake", "sofiablake", "fitness", "Treinos e bem-estar diário.", "sofia-blake", "post-04.jpg"],
  ["Clara Duarte", "claraduarte", "travel", "Viagens e roteiros secretos.", "clara-duarte", "post-05.jpg"],
  ["Mia Castell", "miacastell", "music", "Música acústica e bastidores.", "mia-castell", "post-06.jpg"],
  ["Aiko Lume", "aikolume", "fashion", "Minimalismo e moda urbana.", "aiko-lume", "post-07.jpg"],
  ["Valentina Rios", "valentinarios", "fitness", "Pilates e alimentação leve.", "valentina-rios", "post-08.jpg"],
  ["Zara Monteiro", "zaramonteiro", "beauty", "Beleza, cabelo e autoestima.", "zara-monteiro", "post-09.jpg"],
  ["Elena Vidal", "elenavidal", "lifestyle", "Rotina slow e decoração.", "elena-vidal", "post-10.jpg"],
  ["Isis Amaral", "isisamaral", "travel", "Praias e aventuras pelo Brasil.", "isis-amaral", "post-11.jpg"],
  ["Grace Halden", "gracehalden", "music", "Voz, piano e noites de jazz.", "grace-halden", "post-12.jpg"],
  ["Lara Nakamura", "laranakamura", "lifestyle", "Gastronomia e dicas de SP.", "lara-nakamura", null],
  ["Maya Torres", "mayatorres", "fitness", "Treino, praia e muita energia.", "maya-torres", null],
  ["Kiara Lopes", "kiaralopes", "fashion", "Moda ousada e looks de verão.", "kiara-lopes", null],
  ["Alana Reis", "alanareis", "travel", "Ilhas, barcos e pôr do sol.", "alana-reis", null],
] as const;

async function main() {
  for (const [name, username, category, bio, fileSlug, postFile] of creators) {
    const email =
      username === "lunaferraz"
        ? "criadora@mimelux.com.br"
        : `${username}@creators.patrocino.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: demoPasswordHash, isDemo: true },
      create: {
        email,
        passwordHash: demoPasswordHash,
        role: "CREATOR",
        emailVerifiedAt: new Date(),
        isDemo: true,
      },
    });
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { name, username, bio, isDemo: true },
      create: {
        userId: user.id,
        name,
        username,
        bio,
        city: "Brasil",
        avatarUrl: `/media/generated/creator-${fileSlug}-avatar.jpg`,
        coverUrl: `/media/generated/creator-${fileSlug}-cover.jpg`,
        isDemo: true,
      },
    });
    const creator = await prisma.creator.upsert({
      where: { userId: user.id },
      update: { status: "ACTIVE", category, isDemo: true },
      create: {
        userId: user.id,
        status: "ACTIVE",
        category,
        aiGenerated: true,
        fictitious: true,
        isDemo: true,
      },
    });
    for (const [months, discount] of [[1, 0], [3, 10], [6, 20], [12, 30]] as const) {
      const name = months === 1 ? "Mensal" : `${months} meses`;
      const existing = await prisma.plan.findFirst({ where: { creatorId: creator.id, durationMonths: months } });
      if (!existing) {
        await prisma.plan.create({
          data: { creatorId: creator.id, name, description: "Plano fictício de demonstração.", priceCents: 2990 * months, durationMonths: months, discountPercent: discount, isDemo: true },
        });
      }
    }
    if (postFile) {
      const existing = await prisma.post.findFirst({ where: { creatorId: creator.id, caption: { contains: "Conteúdo aberto" } } });
      if (!existing) {
        await prisma.post.create({
          data: {
            creatorId: creator.id,
            caption: `Conteúdo aberto de ${name} · perfil fictício gerado por IA.`,
            visibility: "FREE",
            likeCount: 1240,
            publishedAt: new Date(),
            isDemo: true,
            media: { create: { kind: "IMAGE", storageKey: `/media/generated/${postFile}`, mimeType: "image/jpeg", isDemo: true } },
          },
        });
      }
    }

    const creatorPosts = await prisma.post.findMany({ where: { creatorId: creator.id }, orderBy: { createdAt: "asc" } });
    for (const [postIndex, post] of creatorPosts.entries()) {
      await prisma.post.update({
        where: { id: post.id },
        data: { likeCount: 1240 + postIndex * 317 },
      });
      const comment = await prisma.postComment.findFirst({ where: { postId: post.id, isDemo: true } });
      if (!comment) {
        await prisma.postComment.create({
          data: {
            postId: post.id,
            authorName: "Marina Costa",
            body: "Que luz linda nesse registro.",
            isDemo: true,
          },
        });
      }
    }

    const review = await prisma.review.findFirst({ where: { creatorId: creator.id, isDemo: true } });
    if (!review) {
      await prisma.review.createMany({
        data: [
          {
            creatorId: creator.id,
            authorName: "Marina Costa",
            rating: 5,
            body: "Acompanhar de perto vale cada detalhe.",
            subscriber: true,
            isDemo: true,
          },
          {
            creatorId: creator.id,
            authorName: "Pedro Almeida",
            rating: 4,
            body: "A rotina publicada aqui parece feita com cuidado.",
            subscriber: true,
            isDemo: true,
          },
        ],
      });
    }
  }

  await prisma.user.upsert({
    where: { email: "fan@mimelux.com.br" },
    update: { passwordHash: demoPasswordHash, isDemo: true },
    create: { email: "fan@mimelux.com.br", passwordHash: demoPasswordHash, role: "FAN", emailVerifiedAt: new Date(), isDemo: true, profile: { create: { name: "Fã Demo", username: "fandemo", isDemo: true } } },
  });
  const affiliateUser = await prisma.user.upsert({
    where: { email: "afiliado@mimelux.com.br" },
    update: { passwordHash: demoPasswordHash, isDemo: true },
    create: { email: "afiliado@mimelux.com.br", passwordHash: demoPasswordHash, role: "AFFILIATE", emailVerifiedAt: new Date(), isDemo: true, profile: { create: { name: "Afiliado Demo", username: "afiliadodemo", isDemo: true } } },
  });
  await prisma.affiliate.upsert({
    where: { userId: affiliateUser.id },
    update: { isDemo: true },
    create: { userId: affiliateUser.id, code: "LUXDEMO", displayName: "Afiliado Demo", isDemo: true },
  });
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
