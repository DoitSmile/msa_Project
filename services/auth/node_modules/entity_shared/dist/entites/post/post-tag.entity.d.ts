import { Post } from "./post.entity";
export declare class PostTag {
    id: string;
    content: string;
    name: string;
    userId: string;
    post: Post[];
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}
