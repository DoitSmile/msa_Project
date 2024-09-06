import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserInput {
  @IsNotEmpty({ message: '이름을 입력해주세요' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: '이메일을 입력해주세요' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: '핸드폰번호를 입력해주세요' })
  @IsString()
  phone: string;

  @IsNotEmpty({ message: '비밀번호를 입력해주세요' })
  @IsString()
  password: string;
}
