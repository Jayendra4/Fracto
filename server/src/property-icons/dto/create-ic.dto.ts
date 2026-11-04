// import { ApiProperty } from '@nestjs/swagger';
// import { IsArray, ValidateNested, IsString } from 'class-validator';
// import { Type } from 'class-transformer';

// class WhyInvestedItemDto {
//   @ApiProperty()
//   @IsString()
//   icon: string;

//   @ApiProperty()
//   @IsString()
//   title: string;

//   @ApiProperty()
//   @IsString()
//   description: string;
// }

// export class WhyInvestedDto {
//   @ApiProperty({ type: [WhyInvestedItemDto] })
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => WhyInvestedItemDto)
//   whyInvested: WhyInvestedItemDto[];
// }
