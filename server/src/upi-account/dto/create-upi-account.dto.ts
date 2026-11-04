import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Length,
  IsUrl,
} from 'class-validator';

export class CreateUpiAccountDto {
  @ApiProperty({
    example: 'hdfc@okhdfcbank',
    description: 'Valid UPI ID',
  })
  @IsNotEmpty()
  @IsString()
  @Length(5, 50)
  @Matches(/^[a-zA-Z0-9.\-_]{2,50}@[a-zA-Z]{2,50}$/, {
    message: 'Invalid UPI ID format',
  })
  upiId: string;

  @ApiProperty({
    example: 'https://yourcdn.com/qrcode.png',
    description: 'QR code image URL',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'QR Code must be a valid URL' })
  qrCode?: string;
}
