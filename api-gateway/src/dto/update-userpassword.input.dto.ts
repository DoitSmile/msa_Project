import { Column } from 'typeorm';

export class UpdatePasswordInput {
  @Column()
  password: string;

  @Column()
  new_password: string;

  @Column()
  new_password_check: string;
}
