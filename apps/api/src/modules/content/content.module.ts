import { Body, Controller, Get, HttpCode, Module, Param, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { database } from "@mimelux/db/runtime";
import { z } from "zod";

const createPostSchema = z.object({
  caption: z.string().min(1).max(500),
  visibility: z.enum(["free", "subscriber", "ppv"]),
  mediaIds: z.array(z.string()).min(1),
  priceCents: z.number().int().positive().optional(),
});

@ApiTags("content")
@Controller()
class ContentController {
  private readonly includeDemo = process.env.DEMO_MODE !== "false";

  @Get("feed")
  @ApiOperation({ summary: "Get the authenticated feed" })
  feed() {
    return { items: [], nextCursor: null, source: "api-shell" };
  }

  @Post("posts")
  @HttpCode(501)
  @ApiOperation({ summary: "Create a post (contract only in V0.1)" })
  create(@Body() body: unknown) {
    return { input: createPostSchema.parse(body), code: "NOT_IMPLEMENTED" };
  }

  @Get("posts/:id")
  get(@Param("id") id: string) {
    return { item: null, id, source: "api-shell" };
  }

  @Get("posts/:id/comments")
  @ApiOperation({ summary: "List comments for a post" })
  async comments(@Param("id") id: string) {
    const items = await database.postComment.findMany({
      where: { postId: id, ...(this.includeDemo ? {} : { isDemo: false }) },
      orderBy: { createdAt: "asc" },
    });
    return {
      items: items.map((item) => ({
        id: item.id,
        postId: item.postId,
        authorName: item.authorName,
        body: item.body,
      })),
      source: "postgres",
    };
  }

  @Get("reviews")
  @ApiOperation({ summary: "List subscriber reviews for a creator" })
  async reviews(@Query("creatorId") creatorId = "") {
    const items = await database.review.findMany({
      where: { creatorId, ...(this.includeDemo ? {} : { isDemo: false }) },
      orderBy: { createdAt: "asc" },
    });
    return {
      items: items.map((item) => ({
        id: item.id,
        creatorId: item.creatorId,
        authorName: item.authorName,
        rating: item.rating,
        body: item.body,
        subscriber: item.subscriber,
      })),
      source: "postgres",
    };
  }
}

@Module({ controllers: [ContentController] })
export class ContentModule {}
