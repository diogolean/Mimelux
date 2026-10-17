import { Controller, Get, Module, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { database } from "@mimelux/db/runtime";

const discoveryQuerySchema = z.object({
  search: z.string().max(80).optional(),
  category: z.string().max(40).optional(),
  cursor: z.string().max(120).optional(),
});

@ApiTags("creators")
@Controller("creators")
class CreatorsController {
  private readonly includeDemo = process.env.DEMO_MODE !== "false";

  @Get()
  @ApiOperation({ summary: "List creators" })
  async list(@Query() query: unknown) {
    const parsed = discoveryQuerySchema.parse(query);
    const creators = await database.creator.findMany({
      where: {
        ...(this.includeDemo ? {} : { isDemo: false }),
        status: "ACTIVE",
        ...(parsed.category ? { category: { equals: parsed.category, mode: "insensitive" } } : {}),
        ...(parsed.search
          ? {
              user: {
                profile: {
                  is: {
                    OR: [
                      { name: { contains: parsed.search, mode: "insensitive" } },
                      { username: { contains: parsed.search, mode: "insensitive" } },
                    ],
                  },
                },
              },
            }
          : {}),
      },
      include: { user: { include: { profile: true } }, plans: { where: { active: true } } },
      take: 50,
      orderBy: { createdAt: "asc" },
    });
    return { items: creators.map(this.present), nextCursor: null, source: "postgres" };
  }

  @Get("ranking")
  @ApiOperation({ summary: "List ranked creators" })
  async ranking() {
    return this.list({});
  }

  @Get(":username")
  @ApiOperation({ summary: "Get a creator profile" })
  async get(@Param("username") username: string) {
    const creator = await database.creator.findFirst({
      where: {
        ...(this.includeDemo ? {} : { isDemo: false }),
        user: { profile: { is: { username } } },
      },
      include: {
        user: { include: { profile: true } },
        plans: { where: { active: true } },
        promotions: { where: { active: true } },
        contentPacks: { where: { active: true } },
      },
    });
    return creator ? this.present(creator) : null;
  }

  private present(creator: {
    id: string;
    category: string;
    aiGenerated: boolean;
    fictitious: boolean;
    user: { profile: { name: string; username: string; bio: string | null; city: string | null; avatarUrl: string | null; coverUrl: string | null } | null };
    plans: { id: string; name: string; priceCents: number; durationMonths: number; discountPercent: number }[];
  }) {
    const profile = creator.user.profile;
    return {
      id: creator.id,
      name: profile?.name ?? "Creator",
      username: profile?.username ?? creator.id,
      bio: profile?.bio ?? "",
      city: profile?.city ?? "",
      avatarUrl: profile?.avatarUrl ?? "",
      coverUrl: profile?.coverUrl ?? "",
      category: creator.category,
      verified: true,
      isFree: (creator.plans[0]?.priceCents ?? 0) === 0,
      monthlyPriceCents: creator.plans.find((plan) => plan.durationMonths === 1)?.priceCents ?? 0,
      subscriberCount: 0,
      postCount: 0,
      aiGenerated: creator.aiGenerated,
      fictitious: creator.fictitious,
    };
  }
}

@Module({ controllers: [CreatorsController] })
export class CreatorsModule {}
