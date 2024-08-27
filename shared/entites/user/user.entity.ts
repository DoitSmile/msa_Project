import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity() // class가 실행될 때 typeorm에 의해 entity테이블 생성
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  age: number;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  password: string;

  //직접 구현했을 때와 다르게, 데이터를 조회할때 조건을 주지 않아도 삭제 되지 않은 데이터만 조회됨
  @DeleteDateColumn()
  deletedAt: Date;
}
