import { Body, Controller, Get, HttpCode, Module, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
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
}

@Module({ controllers: [ContentController] })
export class ContentModule {}
