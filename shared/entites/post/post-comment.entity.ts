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

  //사용자 정보(userId)는 외부 서비스에서 관리되며, 이 서비스에서는 ID만 참조합니다.
  @Column()
  userId: string;

  // 댓글이 달린 게시물과의 관계
  @ManyToOne(() => Post, (post) => post.comment)
  post: Post;

  // ----------이 설정은 parentId가 부모 댓글의 UUID를 저장할 것임을 나타냅니다. ------------
  // 새 댓글을 생성할 때, TypeORM은 parent 객체의 id(UUID)를 가져와 parentId 필드에 저장합니다.
  // 자동으로 생겨 굳이 명시할 필요 없으나 명시해줌
  @Column({ nullable: true })
  parentId: string | null;

  // 자기 참조
  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: "parentId" })
  //name: 'parentId'는 위에서 정의한 parentId 컬럼을 외래 키로 사용하라고 TypeORM에게 알려줌
  parent: Comment;
  //TypeORM은 @ManyToOne 관계와 @JoinColumn을 보고 parentId가 다른 Comment 엔티티의 ID를 참조해야 한다는 것을 이해합니다.
  //Comment 엔티티의 ID가 UUID이므로, parentId는 자동으로 부모 댓글의 UUID를 저장하게 됩니다.
  //데이터 저장 시, TypeORM은 parent 객체의 ID를 가져와 parentId 컬럼에 저장합니다.
  // -------------------------------------------------------------------------------------
  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @CreateDateColumn({ name: "create_at", comment: "생성일" })
  createdAt: Date;

  @UpdateDateColumn({ name: "update_at", comment: "수정일" })
  updatedAt?: Date | null;

  @DeleteDateColumn({ name: "delete_at", comment: "삭제일" })
  deletedAt?: Date | null;
}
