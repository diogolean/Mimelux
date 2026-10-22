import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import {
  demoCreatorCreatedAt,
  demoExtraPostsFor,
  demoPostPublishedAt,
  imageFile,
  initialCreators,
  initialPosts,
  launchCreatorCreatedAt,
  launchPostPublishedAt,
  modelMediaPath,
  withAssetVersion,
} from "@mimelux/core";

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
  for (const [index, [name, username, category, bio, fileSlug, postFile]] of creators.entries()) {
    const createdAt = demoCreatorCreatedAt(index);
    const avatarUrl = withAssetVersion(`/media/generated/creator-${fileSlug}-avatar.jpg`);
    const coverUrl = withAssetVersion(`/media/generated/creator-${fileSlug}-cover.jpg`);
    const email =
      username === "lunaferraz"
        ? "criadora@mimelux.com.br"
        : `${username}@creators.patrocino.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: demoPasswordHash, isDemo: true, createdAt },
      create: {
        email,
        passwordHash: demoPasswordHash,
        role: "CREATOR",
        emailVerifiedAt: new Date(),
        isDemo: true,
        createdAt,
      },
    });
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { name, username, bio, avatarUrl, coverUrl, isDemo: true },
      create: {
        userId: user.id,
        name,
        username,
        bio,
        city: "Brasil",
        avatarUrl,
        coverUrl,
        isDemo: true,
      },
    });
    const creator = await prisma.creator.upsert({
      where: { userId: user.id },
      update: { status: "ACTIVE", category, isDemo: true, createdAt },
      create: {
        userId: user.id,
        status: "ACTIVE",
        category,
        aiGenerated: true,
        fictitious: true,
        isDemo: true,
        createdAt,
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
      const bareKey = `/media/generated/${postFile}`;
      const storageKey = withAssetVersion(bareKey);
      const existing = await prisma.post.findFirst({
        where: { creatorId: creator.id, caption: { contains: "Conteúdo aberto" } },
        include: { media: true },
      });
      if (!existing) {
        await prisma.post.create({
          data: {
            creatorId: creator.id,
            caption: `Conteúdo aberto de ${name} · perfil fictício gerado por IA.`,
            visibility: "FREE",
            likeCount: 1240,
            publishedAt: demoPostPublishedAt(index),
            isDemo: true,
            media: { create: { kind: "IMAGE", storageKey, mimeType: "image/jpeg", isDemo: true } },
          },
        });
      } else {
        for (const item of existing.media) {
          const bare = item.storageKey.split("?")[0];
          if (bare === bareKey && item.storageKey !== storageKey) {
            await prisma.media.update({ where: { id: item.id }, data: { storageKey } });
          }
        }
      }
    }

    const creatorPosts = await prisma.post.findMany({
      where: { creatorId: creator.id },
      orderBy: { createdAt: "asc" },
      include: { media: { select: { storageKey: true } } },
    });
    const legacyPosts = creatorPosts.filter((post) =>
      post.media.every((item) => !(item.storageKey.split("?")[0] ?? "").startsWith("/media/models/demo/")),
    );
    for (const [postIndex, post] of legacyPosts.entries()) {
      await prisma.post.update({
        where: { id: post.id },
        data: { likeCount: 1240 + postIndex * 317, publishedAt: demoPostPublishedAt(index * 20 + postIndex) },
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
    await seedDemoExtraPosts(creator.id, fileSlug);

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
  await seedInitialCreators();
  await versionStoredAssetUrls();
  await ensureSeedAdmins();
}

async function seedDemoExtraPosts(creatorId: string, slug: string) {
  for (const post of demoExtraPostsFor(slug)) {
    const bareKey = post.path.split("?")[0] ?? post.path;
    const existing = await prisma.media.findFirst({
      where: {
        post: { creatorId },
        OR: [{ storageKey: bareKey }, { storageKey: { startsWith: `${bareKey}?` } }],
      },
      select: { id: true, postId: true, storageKey: true },
    });
    const data = {
      caption: post.caption,
      visibility: post.free ? "FREE" as const : "SUBSCRIBERS" as const,
      likeCount: post.likes,
      publishedAt: post.publishedAt,
      isDemo: true,
    };
    if (!existing?.postId) {
      await prisma.post.create({
        data: {
          creatorId,
          ...data,
          media: { create: { kind: "IMAGE", storageKey: post.path, mimeType: "image/jpeg", isDemo: true } },
        },
      });
    } else {
      await prisma.post.update({ where: { id: existing.postId }, data });
      if (existing.storageKey !== post.path) {
        await prisma.media.update({ where: { id: existing.id }, data: { storageKey: post.path } });
      }
    }
  }
}

async function versionStoredAssetUrls() {
  const profiles = await prisma.profile.findMany({
    select: { id: true, avatarUrl: true, coverUrl: true },
  });
  for (const profile of profiles) {
    const avatarUrl = profile.avatarUrl ? withAssetVersion(profile.avatarUrl) : profile.avatarUrl;
    const coverUrl = profile.coverUrl ? withAssetVersion(profile.coverUrl) : profile.coverUrl;
    if (avatarUrl !== profile.avatarUrl || coverUrl !== profile.coverUrl) {
      await prisma.profile.update({ where: { id: profile.id }, data: { avatarUrl, coverUrl } });
    }
  }
  const media = await prisma.media.findMany({ select: { id: true, storageKey: true } });
  for (const item of media) {
    const storageKey = withAssetVersion(item.storageKey);
    if (storageKey !== item.storageKey) {
      await prisma.media.update({ where: { id: item.id }, data: { storageKey } });
    }
  }
}

async function seedInitialCreators() {
  for (const [index, creator] of initialCreators.entries()) {
    const createdAt = launchCreatorCreatedAt(index);
    const email = `${creator.slug}@creators.patrocino.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: demoPasswordHash, isDemo: true, role: "CREATOR", createdAt },
      create: {
        email,
        passwordHash: demoPasswordHash,
        role: "CREATOR",
        emailVerifiedAt: new Date(),
        isDemo: true,
        createdAt,
      },
    });
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        name: creator.displayName,
        username: creator.slug,
        bio: creator.bio,
        city: creator.city,
        avatarUrl: modelMediaPath(creator.slug, imageFile(1)),
        coverUrl: modelMediaPath(creator.slug, imageFile(2)),
        isDemo: true,
      },
      create: {
        userId: user.id,
        name: creator.displayName,
        username: creator.slug,
        bio: creator.bio,
        city: creator.city,
        avatarUrl: modelMediaPath(creator.slug, imageFile(1)),
        coverUrl: modelMediaPath(creator.slug, imageFile(2)),
        isDemo: true,
      },
    });
    const row = await prisma.creator.upsert({
      where: { userId: user.id },
      update: {
        status: "ACTIVE",
        category: creator.category,
        ownership: "HOUSE",
        isDemo: true,
        createdAt,
      },
      create: {
        userId: user.id,
        status: "ACTIVE",
        category: creator.category,
        ownership: "HOUSE",
        fictitious: true,
        isDemo: true,
        createdAt,
      },
    });
    for (const [months, discount] of [[1, 0], [3, 10], [6, 20], [12, 30]] as const) {
      const name = months === 1 ? "Mensal" : `${months} meses`;
      const priceCents = creator.monthlyPriceCents * months;
      const existing = await prisma.plan.findFirst({ where: { creatorId: row.id, durationMonths: months } });
      if (!existing) {
        await prisma.plan.create({
          data: {
            creatorId: row.id,
            name,
            description: "Assinatura mensal.",
            priceCents,
            durationMonths: months,
            discountPercent: discount,
            isDemo: true,
          },
        });
      } else if (existing.priceCents !== priceCents || existing.discountPercent !== discount) {
        await prisma.plan.update({
          where: { id: existing.id },
          data: { priceCents, discountPercent: discount, name },
        });
      }
    }
    for (const [postIndex, post] of initialPosts(creator).entries()) {
      const publishedAt = launchPostPublishedAt(index, postIndex);
      const bareKey = post.path.split("?")[0] ?? post.path;
      const existing = await prisma.media.findFirst({
        where: {
          post: { creatorId: row.id },
          OR: [{ storageKey: bareKey }, { storageKey: { startsWith: `${bareKey}?` } }],
        },
        select: { id: true, postId: true, storageKey: true },
      });
      if (!existing?.postId) {
        await prisma.post.create({
          data: {
            creatorId: row.id,
            caption: post.caption,
            visibility: post.free ? "FREE" : "SUBSCRIBERS",
            likeCount: post.likes,
            publishedAt,
            isDemo: true,
            media: { create: { kind: "IMAGE", storageKey: post.path, mimeType: "image/jpeg", isDemo: true } },
          },
        });
      } else {
        await prisma.post.update({
          where: { id: existing.postId },
          data: {
            caption: post.caption,
            visibility: post.free ? "FREE" : "SUBSCRIBERS",
            likeCount: post.likes,
            publishedAt,
          },
        });
        if (existing.storageKey !== post.path) {
          await prisma.media.update({ where: { id: existing.id }, data: { storageKey: post.path } });
        }
      }
    }
  }
}

async function ensureSeedAdmins() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const suffix = Date.now().toString(36);
      await prisma.user.create({
        data: {
          email,
          passwordHash: await hash(password, 12),
          role: "ADMIN",
          emailVerifiedAt: new Date(),
          profile: { create: { name: "Admin", username: `admin-${suffix}` } },
        },
      });
    }
  }
  if (process.env.DEMO_MODE === "true" && process.env.NODE_ENV !== "production") {
    const existing = await prisma.user.findUnique({ where: { email: "admin@patrocino.com" } });
    if (!existing) {
      const suffix = Date.now().toString(36);
      await prisma.user.create({
        data: {
          email: "admin@patrocino.com",
          passwordHash: demoPasswordHash,
          role: "ADMIN",
          emailVerifiedAt: new Date(),
          isDemo: true,
          profile: { create: { name: "Admin Demo", username: `admin-${suffix}`, isDemo: true } },
        },
      });
    }
  }
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
