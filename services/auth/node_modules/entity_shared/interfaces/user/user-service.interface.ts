import { Column } from 'typeorm';

export class IUserCreateUser {
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
}

export class IUserEmail {
  email: string;
}

export class IUserUpdatePassword {
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
// export class IUserCreateUser {
//   createUserInput: CreateUserInput;
// }

// export class IUserUpdatePassword {
//   updatePasswordInput: UpdatePasswordInput;
// }
