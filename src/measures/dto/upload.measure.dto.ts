import {
  IsBase64,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UploadMeasureDto {
  @IsBase64()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  customer_code: string;

  @IsDateString()
  @IsNotEmpty()
  measure_datetime: string;

  @IsEnum(['WATER', 'GAS'], {
    message: 'Measure type must be either "WATER" or "GAS"',
  })
  measure_type: 'WATER' | 'GAS';
}
