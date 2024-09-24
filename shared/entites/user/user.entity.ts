import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
} from "typeorm";
import { Like } from "../post/post-like.entity";

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

  @OneToOne(() => Like, (like) => like.user)
  like: Like;

  //직접 구현했을 때와 다르게, 데이터를 조회할때 조건을 주지 않아도 삭제 되지 않은 데이터만 조회됨
  @DeleteDateColumn()
  deletedAt: Date;
}
