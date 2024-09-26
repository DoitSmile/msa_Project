import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "../user/user.entity";
import { Post } from "./post.entity";

@Entity()
export class Like {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.like)
  user: User;

  @ManyToOne(() => Post, (post) => post.like)
  post: Post;
}
