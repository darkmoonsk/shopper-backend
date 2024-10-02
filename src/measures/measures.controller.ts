import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MeasuresService } from './services/measures.service';
import { UploadMeasureDto } from './dto/upload.measure.dto';
import { ConfirmMeasureDto } from './dto/confirm.measure.dto';

@Controller()
export class MeasuresController {
  constructor(private readonly measuresService: MeasuresService) {}

  @Post('upload')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async upload(@Body() uploadDto: UploadMeasureDto) {
    return await this.measuresService.uploadMeasure(uploadDto);
  }

  @Patch('confirm')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async confirm(@Body() confirmDto: ConfirmMeasureDto) {
    return await this.measuresService.confirmMeasure(confirmDto);
  }

  @Get(':customerCode/list')
  async list(
    @Param('customerCode') customerCode: string,
    @Query('measure_type') measure_type?: 'WATER' | 'GAS',
  ) {
    return await this.measuresService.listMeasures(customerCode, measure_type);
  }
}
