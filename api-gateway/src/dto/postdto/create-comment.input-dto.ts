import { IsOptional, IsString } from 'class-validator';

export class CreateCommentInput {
  @IsString()
  content: string;

  @IsString()
  postId: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
