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
exports.Post = void 0;
const typeorm_1 = require("typeorm");
const post_comment_entity_1 = require("./post-comment.entity");
const post_tag_entity_1 = require("./post-tag.entity");
const post_category_entity_1 = require("./post-category.entity");
const post_bookmark_entity_1 = require("./post-bookmark.entity");
let Post = class Post {
};
exports.Post = Post;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Post.prototype, "views", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Post.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { nullable: true }),
    __metadata("design:type", Array)
], Post.prototype, "imageUrls", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Post.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "prefix", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "categoryId" }),
    (0, typeorm_1.ManyToOne)(() => post_category_entity_1.Category, (category) => category.post),
    __metadata("design:type", post_category_entity_1.Category)
], Post.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.JoinTable)(),
    (0, typeorm_1.ManyToMany)(() => post_tag_entity_1.PostTag, (postTag) => postTag.post),
    __metadata("design:type", Array)
], Post.prototype, "postTag", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => post_comment_entity_1.Comment, (comment) => comment.post, { cascade: true }),
    __metadata("design:type", Array)
], Post.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => post_bookmark_entity_1.Bookmark, (bookmark) => bookmark.post, { cascade: true }),
    __metadata("design:type", Array)
], Post.prototype, "bookmarks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "create_at", comment: "생성일" }),
    __metadata("design:type", Date)
], Post.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "update_at", comment: "수정일" }),
    __metadata("design:type", Date)
], Post.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: "delete_at", comment: "삭제일" }),
    __metadata("design:type", Date)
], Post.prototype, "deletedAt", void 0);
exports.Post = Post = __decorate([
    (0, typeorm_1.Entity)()
], Post);
//# sourceMappingURL=post.entity.js.map