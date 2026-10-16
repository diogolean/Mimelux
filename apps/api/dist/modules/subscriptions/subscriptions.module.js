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
exports.SubscriptionsModule = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_1 = require("zod");
const subscriptionSchema = zod_1.z.object({
    creatorId: zod_1.z.string().min(1),
    planId: zod_1.z.string().min(1),
    mode: zod_1.z.literal("demo"),
});
let SubscriptionsController = class SubscriptionsController {
    list() {
        return { items: [], source: "api-shell" };
    }
    checkout(body) {
        return {
            accepted: true,
            simulation: true,
            input: subscriptionSchema.parse(body),
        };
    }
};
__decorate([
    (0, common_1.Get)("me"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)("checkout"),
    (0, common_1.HttpCode)(202),
    (0, swagger_1.ApiOperation)({ summary: "Accept a demo subscription simulation" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "checkout", null);
SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)("subscriptions"),
    (0, common_1.Controller)("subscriptions")
], SubscriptionsController);
let SubscriptionsModule = class SubscriptionsModule {
};
exports.SubscriptionsModule = SubscriptionsModule;
exports.SubscriptionsModule = SubscriptionsModule = __decorate([
    (0, common_1.Module)({ controllers: [SubscriptionsController] })
], SubscriptionsModule);
//# sourceMappingURL=subscriptions.module.js.map