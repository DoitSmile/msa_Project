import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
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
}
