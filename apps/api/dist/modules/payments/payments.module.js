"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_1 = require("zod");
const demoPurchaseSchema = zod_1.z.object({ mode: zod_1.z.literal("demo") });
let PaymentsController = class PaymentsController {
    checkout(contentId, body) {
        return {
            accepted: true,
            simulation: true,
            contentId,
            input: demoPurchaseSchema.parse(body),
        };
    }
    webhook(provider, idempotencyKey) {
        return {
            code: "NOT_IMPLEMENTED",
            provider,
            idempotencyKey: idempotencyKey ?? null,
        };
    }
};
__decorate([
    (0, common_1.Post)("purchases/:contentId/checkout"),
    (0, common_1.HttpCode)(202),
    (0, swagger_1.ApiOperation)({ summary: "Accept a demo content purchase simulation" }),
    __param(0, (0, common_1.Param)("contentId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)("payments/webhooks/:provider"),
    (0, common_1.HttpCode)(501),
    __param(0, (0, common_1.Param)("provider")),
    __param(1, (0, common_1.Headers)("idempotency-key")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "webhook", null);
PaymentsController = __decorate([
    (0, swagger_1.ApiTags)("payments"),
    (0, common_1.Controller)()
], PaymentsController);
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({ controllers: [PaymentsController] })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map