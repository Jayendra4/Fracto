import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  Length,
  IsNumberString,
} from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({
    example: 'Sakshi Sharma',
    description: 'Account holder name',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Account holder name must contain only letters and spaces',
  })
  @Length(2, 100)
  accountHolderName: string;

  @ApiProperty({
    example: 'HDFC Bank',
    description: 'Bank name',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Bank name must contain only letters and spaces',
  })
  @Length(2, 100)
  bankName: string;

  @ApiProperty({
    example: '123456789012',
    description: 'Bank account number',
  })
  @IsNotEmpty()
  @IsNumberString({}, { message: 'Account number must contain only digits' })
  @Length(9, 18, {
    message: 'Account number must be between 9 and 18 digits',
  })
  accountNumber: string;

  @ApiProperty({
    example: 'HDFC0001234',
    description: 'IFSC code',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message: 'Invalid IFSC code format',
  })
  ifscCode: string;
}
