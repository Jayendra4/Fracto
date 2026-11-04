import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { ChatroomType } from '../../generated/prisma/enums';

export class CreateChatroomDto {
  @ApiProperty({ enum: ChatroomType })
  @IsNotEmpty()
  @IsEnum(ChatroomType)
  type: ChatroomType;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  participantIds: number[];
}
