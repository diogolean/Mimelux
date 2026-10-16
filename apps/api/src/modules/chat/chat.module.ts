import { Body, Controller, Get, HttpCode, Module, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

const messageSchema = z.object({
  body: z.string().min(1).max(2000),
  mediaIds: z.array(z.string()).optional(),
  ppvPriceCents: z.number().int().positive().optional(),
});

@ApiTags("chat")
@Controller("conversations")
class ChatController {
  @Get()
  @ApiOperation({ summary: "List conversations" })
  list() {
    return { items: [], source: "api-shell" };
  }

  @Get(":id/messages")
  messages(@Param("id") id: string) {
    return { items: [], conversationId: id, source: "api-shell" };
  }

  @Post(":id/messages")
  @HttpCode(501)
  send(@Param("id") id: string, @Body() body: unknown) {
    return {
      code: "NOT_IMPLEMENTED",
      conversationId: id,
      input: messageSchema.parse(body),
    };
  }
}

@Module({ controllers: [ChatController] })
export class ChatModule {}
