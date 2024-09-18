import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  name: string;

  @Column()
  userId: string;

  // @Column({
  //   type: "int",
  //   default: 0,
  //   comment: "게시글 조회수",
  // })
  // view: number;

  @CreateDateColumn({ name: "create_at", comment: "생성일" })
  createdAt: Date;

  @UpdateDateColumn({ name: "update_at", comment: "수정일" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "delete_at", comment: "삭제일" })
  deletedAt?: Date | null;

  // @ManyToOne(() => Category, (category) => category.id)
  // @JoinColumn({ name: "boardCategoryId" }) //칼럼명을 Id가 아닌 내가 원하는 대로 정하고 싶다면
  // category: Category;

  // @ManyToOne(() => User, (user) => user.id)
  // @JoinColumn({ name: "boardUserId" }) //칼럼명을 Id가 아닌 내가 원하는 대로 정하고 싶다면
  // user: User;

  // @Column()
  // boardCategoryId: string;

  // @Column()
  // boardUserId: string;
}
