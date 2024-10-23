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
exports.Comment = void 0;
const typeorm_1 = require("typeorm");
const post_entity_1 = require("./post.entity");
let Comment = class Comment {
};
exports.Comment = Comment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Comment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], Comment.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Comment.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Comment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => post_entity_1.Post, (post) => post.comment),
    __metadata("design:type", post_entity_1.Post)
], Comment.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Comment.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Comment, (comment) => comment.replies, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "parentId" }),
    __metadata("design:type", Comment)
], Comment.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comment, (comment) => comment.parent),
    __metadata("design:type", Array)
], Comment.prototype, "replies", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "create_at", comment: "생성일" }),
    __metadata("design:type", Date)
], Comment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "update_at", comment: "수정일" }),
    __metadata("design:type", Date)
], Comment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: "delete_at", comment: "삭제일" }),
    __metadata("design:type", Date)
], Comment.prototype, "deletedAt", void 0);
exports.Comment = Comment = __decorate([
    (0, typeorm_1.Entity)()
], Comment);
//# sourceMappingURL=post-comment.entity.js.map