import { IsEmail, IsString } from 'class-validator';

export class UpdateUserInput {
  @IsString()
  name?: number;

  @IsEmail()
  email?: string;

  @IsString()
  phone?: string;

  @IsString()
  password?: string;
}
