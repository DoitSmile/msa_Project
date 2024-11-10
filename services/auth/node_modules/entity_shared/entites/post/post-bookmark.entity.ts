import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  Column,
} from "typeorm";
import { Post } from "./post.entity";

@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => Post, (post) => post.bookmarks)
  @JoinColumn({ name: "post_id" })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn({ name: "delete_at", comment: "삭제일" })
  deletedAt?: Date | null;
}
