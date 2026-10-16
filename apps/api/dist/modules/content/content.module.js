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
exports.ContentModule = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_1 = require("zod");
const createPostSchema = zod_1.z.object({
    caption: zod_1.z.string().min(1).max(500),
    visibility: zod_1.z.enum(["free", "subscriber", "ppv"]),
    mediaIds: zod_1.z.array(zod_1.z.string()).min(1),
    priceCents: zod_1.z.number().int().positive().optional(),
});
let ContentController = class ContentController {
    feed() {
        return { items: [], nextCursor: null, source: "api-shell" };
    }
    create(body) {
        return { input: createPostSchema.parse(body), code: "NOT_IMPLEMENTED" };
    }
    get(id) {
        return { item: null, id, source: "api-shell" };
    }
};
__decorate([
    (0, common_1.Get)("feed"),
    (0, swagger_1.ApiOperation)({ summary: "Get the authenticated feed" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "feed", null);
__decorate([
    (0, common_1.Post)("posts"),
    (0, common_1.HttpCode)(501),
    (0, swagger_1.ApiOperation)({ summary: "Create a post (contract only in V0.1)" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("posts/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "get", null);
ContentController = __decorate([
    (0, swagger_1.ApiTags)("content"),
    (0, common_1.Controller)()
], ContentController);
let ContentModule = class ContentModule {
};
exports.ContentModule = ContentModule;
exports.ContentModule = ContentModule = __decorate([
    (0, common_1.Module)({ controllers: [ContentController] })
], ContentModule);
//# sourceMappingURL=content.module.js.map