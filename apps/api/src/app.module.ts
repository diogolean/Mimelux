import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { ChatModule } from "./modules/chat/chat.module";
import { ContentModule } from "./modules/content/content.module";
import { CreatorsModule } from "./modules/creators/creators.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    AuthModule,
    CreatorsModule,
    ContentModule,
    SubscriptionsModule,
    PaymentsModule,
    ChatModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
