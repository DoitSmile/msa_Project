import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Comment } from "./post-comment.entity";
import { PostTag } from "./post-tag.entity";
import { Category } from "./post-category.entity";
// import { Like } from "./post-like.entity";

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ default: 0 })
  views: number;

  @Column("text")
  content: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column()
  userId: string;

  @JoinColumn({ name: "categoryId" }) //칼럼명을 Id가 아닌 내가 원하는 대로 정하고 싶다면
  // @Column({ nullable: true })
  @ManyToOne(() => Category, (category) => category.post)
  category: Category;

  // 태그는 상품을 등록할 때 같이 만들어 주면 됨
  // 소유자 쪽에만 JoinTable 작성 ( 다대다에서만 사용 )
  @JoinTable()
  @ManyToMany(() => PostTag, (postTag) => postTag.post)
  postTag: PostTag[];

  @OneToMany(() => Comment, (comment) => comment.post)
  // 관계의 대상 엔티티를 지정 // 엔티티 쪽에서 현재 엔티티를 참조하는 속성을 지정
  comment: Comment[];

  // @OneToMany(() => Like, (like) => like.post)
  // likes: Like[];

  @CreateDateColumn({ name: "create_at", comment: "생성일" })
  createdAt: Date;

  @UpdateDateColumn({ name: "update_at", comment: "수정일" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "delete_at", comment: "삭제일" })
  deletedAt?: Date | null;

  // @Column({
  //   type: "int",
  //   default: 0,
  //   comment: "게시글 조회수",
  // })
  // view: number;
}
