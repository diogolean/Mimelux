"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix("v1");
    app.enableCors({
        origin: process.env.WEB_ORIGIN ?? "http://localhost:3333",
        credentials: true,
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle("Mimelux API")
        .setDescription("Versioned API contract for the Mimelux prototype.")
        .setVersion("0.1")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup("v1/docs", app, document);
    await app.listen(Number(process.env.PORT ?? 3334), "0.0.0.0");
}
void bootstrap();
//# sourceMappingURL=main.js.map