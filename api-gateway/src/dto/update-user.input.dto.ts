import { Column } from 'typeorm';

export class UpdateUserInput {
  @Column()
  name?: number;

  @Column()
  age?: number;

  @Column()
  phone?: string;

  @Column()
  address?: string;

  @Column()
  password?: string;
}
