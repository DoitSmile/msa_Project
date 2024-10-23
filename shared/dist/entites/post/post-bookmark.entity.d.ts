import { Post } from "./post.entity";
export declare class Bookmark {
    id: string;
    userId: string;
    post: Post;
    createdAt: Date;
    deletedAt?: Date | null;
}
