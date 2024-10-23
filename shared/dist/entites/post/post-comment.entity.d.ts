import { Post } from "./post.entity";
export declare class Comment {
    id: string;
    content: string;
    username: string;
    userId: string;
    post: Post;
    parentId: string | null;
    parent: Comment;
    replies: Comment[];
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}
