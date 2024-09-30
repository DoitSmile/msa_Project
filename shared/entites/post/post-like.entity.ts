// import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
// import { User } from "../user/user.entity";
// import { Post } from "./post.entity";

// @Entity()
// export class Like {
//   @PrimaryGeneratedColumn("uuid")
//   id: string;

//   @ManyToOne(() => User, (user) => user.likes)
//   @JoinColumn({ name: "user_id" }) // 외래 키 컬럼의 이름을 명시적으로 user_id로 설정
//   user: User;

//   @ManyToOne(() => Post, (post) => post.likes)
//   @JoinColumn({ name: "post_id" }) // 외래 키 컬럼의 이름을 명시적으로 post_id로 설정
//   post: Post;
// }
