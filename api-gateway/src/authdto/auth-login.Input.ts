import { Column } from 'typeorm';

export class AuthLoginInput {
  @Column()
  email: string;

  @Column()
  password: string;
}
