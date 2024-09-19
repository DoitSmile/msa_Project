import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Post } from "./post.entity";

@Entity()
export class PostTag {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  @Column()
  name: string;

  @Column()
  userId: string;

  @ManyToMany(() => Post, (post) => post.postTag)
  post: Post[];

  @CreateDateColumn({ name: "create_at", comment: "생성일" })
  createdAt: Date;

  @UpdateDateColumn({ name: "update_at", comment: "수정일" })
  updatedAt?: Date | null;

  @DeleteDateColumn({ name: "delete_at", comment: "삭제일" })
  deletedAt?: Date | null;
}
