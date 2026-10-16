import { Body, Controller, Get, HttpCode, Module, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

const subscriptionSchema = z.object({
  creatorId: z.string().min(1),
  planId: z.string().min(1),
  mode: z.literal("demo"),
});

@ApiTags("subscriptions")
@Controller("subscriptions")
class SubscriptionsController {
  @Get("me")
  list() {
    return { items: [], source: "api-shell" };
  }

  @Post("checkout")
  @HttpCode(202)
  @ApiOperation({ summary: "Accept a demo subscription simulation" })
  checkout(@Body() body: unknown) {
    return {
      accepted: true,
      simulation: true,
      input: subscriptionSchema.parse(body),
    };
  }
}

@Module({ controllers: [SubscriptionsController] })
export class SubscriptionsModule {}
