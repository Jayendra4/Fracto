import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SubmitManualInterestPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mobile: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'UTR / Payment ID' })
  @IsNotEmpty()
  @IsString()
  utrNumber: string;

  @ApiProperty({ description: 'Uploaded payment screenshot URL/key' })
  @IsNotEmpty()
  @IsString()
  screenshot: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  consent: boolean;
}
