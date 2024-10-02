import { Module } from '@nestjs/common';
import { MeasuresController } from './measures.controller';
import { MeasuresService } from './services/measures.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiModule } from '../gemini/gemini.module';
import { Measure } from './entities/measure.entity';
import { GeminiService } from '../gemini/services/gemini.service';

@Module({
  imports: [TypeOrmModule.forFeature([Measure]), GeminiModule],
  controllers: [MeasuresController],
  providers: [MeasuresService, GeminiService],
})
export class MeasuresModule {}
