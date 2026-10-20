import { database } from "@mimelux/db/runtime";
import { hash } from "bcryptjs";
import { randomBytes } from "node:crypto";

const demoPasswordHash = "$2b$10$VrD.M82EvcYYKJrnPC0tsua6uUQMdclUMlGAWTYUxR8KOgwL646.a";

async function createAdmin(email: string, passwordHash: string, isDemo: boolean) {
  const existing = await database.user.findUnique({ where: { email } });
  if (existing) return;
  await database.user.create({
    data: {
      email,
      passwordHash,
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      isDemo,
      profile: {
        create: {
          name: isDemo ? "Admin Demo" : "Admin",
          username: `admin-${randomBytes(4).toString("hex")}`,
          isDemo,
        },
      },
    },
  });
}

export async function ensureAdmins() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    await createAdmin(email, await hash(password, 12), false);
  }
  if (process.env.DEMO_MODE === "true" && process.env.NODE_ENV !== "production") {
    await createAdmin("admin@patrocino.com", demoPasswordHash, true);
  }
}
