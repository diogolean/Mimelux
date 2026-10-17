import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.setGlobalPrefix("v1");
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3333",
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Mimelux API")
    .setDescription("Versioned API contract for the Mimelux prototype.")
    .setVersion("0.1")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("v1/docs", app, document);

  await app.listen(Number(process.env.PORT ?? 3334), "0.0.0.0");
}

void bootstrap();
