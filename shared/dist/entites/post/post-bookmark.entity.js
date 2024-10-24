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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bookmark = void 0;
const typeorm_1 = require("typeorm");
const post_entity_1 = require("./post.entity");
let Bookmark = class Bookmark {
};
exports.Bookmark = Bookmark;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Bookmark.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Bookmark.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => post_entity_1.Post, (post) => post.bookmarks),
    (0, typeorm_1.JoinColumn)({ name: "post_id" }),
    __metadata("design:type", post_entity_1.Post)
], Bookmark.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Bookmark.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: "delete_at", comment: "삭제일" }),
    __metadata("design:type", Date)
], Bookmark.prototype, "deletedAt", void 0);
exports.Bookmark = Bookmark = __decorate([
    (0, typeorm_1.Entity)()
], Bookmark);
//# sourceMappingURL=post-bookmark.entity.js.map