import { Column } from 'typeorm';

export class AuthPhoneInput {
  @Column()
  phone_num: string;

  @Column()
  auth_num: string;
}
