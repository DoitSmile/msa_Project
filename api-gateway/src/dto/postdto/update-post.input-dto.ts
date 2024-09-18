import { IsNotEmpty, IsString, Length } from 'class-validator';
export class UpdatePostInput {
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요' })
  title?: string;

  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요' })
  @Length(4000)
  content?: string;
}
