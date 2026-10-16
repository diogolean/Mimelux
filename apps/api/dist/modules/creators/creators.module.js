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
exports.CreatorsModule = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_1 = require("zod");
const discoveryQuerySchema = zod_1.z.object({
    search: zod_1.z.string().max(80).optional(),
    category: zod_1.z.string().max(40).optional(),
    cursor: zod_1.z.string().max(120).optional(),
});
let CreatorsController = class CreatorsController {
    list(query) {
        const parsed = discoveryQuerySchema.parse(query);
        return { items: [], nextCursor: null, query: parsed, source: "api-shell" };
    }
    ranking() {
        return { items: [], nextCursor: null, source: "api-shell" };
    }
    get(username) {
        return { item: null, username, source: "api-shell" };
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List creators" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreatorsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("ranking"),
    (0, swagger_1.ApiOperation)({ summary: "List ranked creators" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CreatorsController.prototype, "ranking", null);
__decorate([
    (0, common_1.Get)(":username"),
    (0, swagger_1.ApiOperation)({ summary: "Get a creator profile" }),
    __param(0, (0, common_1.Param)("username")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CreatorsController.prototype, "get", null);
CreatorsController = __decorate([
    (0, swagger_1.ApiTags)("creators"),
    (0, common_1.Controller)("creators")
], CreatorsController);
let CreatorsModule = class CreatorsModule {
};
exports.CreatorsModule = CreatorsModule;
exports.CreatorsModule = CreatorsModule = __decorate([
    (0, common_1.Module)({ controllers: [CreatorsController] })
], CreatorsModule);
//# sourceMappingURL=creators.module.js.map