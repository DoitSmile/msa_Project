import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
// import { Board } from "../board/board.entity";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  name: string;

  //   ManyToOne의 경우 관계정의가 필수적이지만, OneToMany의 경우 생략이 가능하다.
  //   @OneToMany(() => Board, (board) => board.category)
  //   boards: Board[];
}
