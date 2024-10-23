import { Comment } from "./post-comment.entity";
import { PostTag } from "./post-tag.entity";
import { Category } from "./post-category.entity";
import { Bookmark } from "./post-bookmark.entity";
export declare class Post {
    id: string;
    title: string;
    views: number;
    content: string;
    name: string;
    imageUrls: string[];
    userId: string;
    prefix: string;
    category: Category;
    postTag: PostTag[];
    comment: Comment[];
    bookmarks: Bookmark[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
