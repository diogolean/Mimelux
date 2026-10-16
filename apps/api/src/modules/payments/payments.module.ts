import { Body, Controller, Headers, HttpCode, Module, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

const demoPurchaseSchema = z.object({ mode: z.literal("demo") });

@ApiTags("payments")
@Controller()
class PaymentsController {
  @Post("purchases/:contentId/checkout")
  @HttpCode(202)
  @ApiOperation({ summary: "Accept a demo content purchase simulation" })
  checkout(@Param("contentId") contentId: string, @Body() body: unknown) {
    return {
      accepted: true,
      simulation: true,
      contentId,
      input: demoPurchaseSchema.parse(body),
    };
  }

  @Post("payments/webhooks/:provider")
  @HttpCode(501)
  webhook(
    @Param("provider") provider: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    return {
      code: "NOT_IMPLEMENTED",
      provider,
      idempotencyKey: idempotencyKey ?? null,
    };
  }
}

@Module({ controllers: [PaymentsController] })
export class PaymentsModule {}
