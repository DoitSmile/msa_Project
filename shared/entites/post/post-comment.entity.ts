import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Post } from "./post.entity";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text")
  content: string;

  // @Column()
  // name: string;

  //사용자 정보(userId)는 외부 서비스에서 관리되며, 이 서비스에서는 ID만 참조합니다.
  @Column()
  userId: string;

  // 댓글이 달린 게시물과의 관계
  @ManyToOne(() => Post, (post) => post.comment)
  post: Post;

  // 자기 참조
  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent, { nullable: true })
  replies: Comment[];

  @CreateDateColumn({ name: "create_at", comment: "생성일" })
  createdAt: Date;

  @UpdateDateColumn({ name: "update_at", comment: "수정일" })
  updatedAt?: Date | null;

  @DeleteDateColumn({ name: "delete_at", comment: "삭제일" })
  deletedAt?: Date | null;
}
