import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./post.entity";

// 특정 카테고리 선택 -> id값 넘겨줌
@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  name: string;

  //   ManyToOne의 경우 관계정의가 필수적이지만, OneToMany의 경우 생략이 가능하다.
  @OneToMany(() => Post, (post) => post.category)
  post: Post[];
}
