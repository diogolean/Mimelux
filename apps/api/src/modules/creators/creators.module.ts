import { Controller, Get, Module, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

const discoveryQuerySchema = z.object({
  search: z.string().max(80).optional(),
  category: z.string().max(40).optional(),
  cursor: z.string().max(120).optional(),
});

@ApiTags("creators")
@Controller("creators")
class CreatorsController {
  @Get()
  @ApiOperation({ summary: "List creators" })
  list(@Query() query: unknown) {
    const parsed = discoveryQuerySchema.parse(query);
    return { items: [], nextCursor: null, query: parsed, source: "api-shell" };
  }

  @Get("ranking")
  @ApiOperation({ summary: "List ranked creators" })
  ranking() {
    return { items: [], nextCursor: null, source: "api-shell" };
  }

  @Get(":username")
  @ApiOperation({ summary: "Get a creator profile" })
  get(@Param("username") username: string) {
    return { item: null, username, source: "api-shell" };
  }
}

@Module({ controllers: [CreatorsController] })
export class CreatorsModule {}
