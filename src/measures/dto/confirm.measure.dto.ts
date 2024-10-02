import { IsInt, IsUUID, Min } from 'class-validator';

export class ConfirmMeasureDto {
  @IsUUID()
  measure_uuid: string;

  @IsInt()
  @Min(0)
  confirmed_value: number;
}
