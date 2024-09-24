import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "../user/user.entity";
import { Post } from "./post.entity";
@Entity()
export class Like {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User, (user) => user.like)
  user: User;

  @OneToOne(() => Post, (post) => post.like)
  post: Post;
}
