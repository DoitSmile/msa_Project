import {  IsString } from 'class-validator';

export class UpdatePasswordInput {
  @IsString()
  password: string;

  @IsString()
  new_password: string;

  @IsString()
  confirmNewPassword: string;
}
