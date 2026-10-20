import { Module } from "@nestjs/common";
import { AdminModule } from "./modules/admin/admin.module";
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
    AdminModule,
    CreatorsModule,
    ContentModule,
    SubscriptionsModule,
    PaymentsModule,
    ChatModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
