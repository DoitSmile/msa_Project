import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
// import { Like } from "../post/post-like.entity";

@Entity() // class가 실행될 때 typeorm에 의해 entity테이블 생성
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  // @OneToMany(() => Like, (like) => like.user)
  // likes: Like[];

  //직접 구현했을 때와 다르게, 데이터를 조회할때 조건을 주지 않아도 삭제 되지 않은 데이터만 조회됨
  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn({ name: "create_at", comment: "생성일" })
  createdAt: Date;

  @UpdateDateColumn({ name: "update_at", comment: "수정일" })
  updatedAt: Date;
}
