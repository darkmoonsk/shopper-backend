import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Measure } from '../entities/measure.entity';
import { Repository } from 'typeorm';
import { GeminiService } from '../../gemini/services/gemini.service';
import { UploadMeasureDto } from '../dto/upload.measure.dto';
import { ConfirmMeasureDto } from '../dto/confirm.measure.dto';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MeasuresService {
  constructor(
    @InjectRepository(Measure)
    private readonly measureRepository: Repository<Measure>,
    private geminiSercice: GeminiService,
  ) {}

  private getMonthYear(date: Date): string {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${month < 10 ? '0' + month : month}-${year}`;
  }

  private decodeBase64Image(dataString: string): {
    type: string;
    data: Buffer;
  } {
    // Decodifica a string base64 diretamente para um buffer binário
    const dataBuffer = Buffer.from(dataString, 'base64');

    // Verifica os primeiros bytes para identificar o tipo da imagem (magic numbers)
    const pngMagicNumber = '89504e47'; // Magic number para PNG
    const jpegMagicNumber = 'ffd8ffe0'; // Magic number para JPEG
    const jpegMagicNumberAlt = 'ffd8ffe1'; // Alternativa para JPEG

    // Converte os primeiros 4 bytes do buffer para hexadecimal para comparar com os magic numbers
    const headerHex = dataBuffer.slice(0, 4).toString('hex');

    if (headerHex === pngMagicNumber) {
      return { type: 'image/png', data: dataBuffer };
    } else if (
      headerHex === jpegMagicNumber ||
      headerHex === jpegMagicNumberAlt
    ) {
      return { type: 'image/jpeg', data: dataBuffer };
    } else {
      throw new BadRequestException('Formato de imagem base64 inválido');
    }
  }

  private getExtension(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      default:
        return '';
    }
  }

  async uploadMeasure(uploadMeasureDto: UploadMeasureDto) {
    const { image, customer_code, measure_datetime, measure_type } =
      uploadMeasureDto;
    const measureDate = new Date(measure_datetime);
    const monthYear = this.getMonthYear(measureDate);

    const existingMeasure = await this.measureRepository.findOne({
      where: {
        customerCode: customer_code,
        measureType: measure_type,
        monthYear,
      },
    });

    if (existingMeasure) {
      throw new ConflictException({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      });
    }

    const buffer = this.decodeBase64Image(image);

    const mimeType = buffer.type;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(mimeType)) {
      throw new BadRequestException(
        'Apenas arquivos de imagem JPG e PNG são permitidos!',
      );
    }

    const filename = `${uuid()}${this.getExtension(mimeType)}`;

    console.log(__dirname);

    const dir = path.join(process.cwd(), 'images');
    if (!fs.opendir(dir)) {
      fs.mkdir(dir, { recursive: true });
    }

    const filePath = path.join(process.cwd(), 'images', filename);

    await fs.writeFile(filePath, buffer.data, 'base64');

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/images/${filename}`;

    const measureValue = await this.geminiSercice.extractMeasureValue(image);

    const newMeasure = this.measureRepository.create({
      customerCode: customer_code,
      measureDateTime: measureDate,
      measureType: measure_type,
      measureValue,
      imageUrl,
      monthYear,
      hasConfirmed: false,
    });

    await this.measureRepository.save(newMeasure);

    return {
      image_url: imageUrl,
      measure_value: measureValue,
      measure_uuid: newMeasure.measureUuid,
    };
  }

  async confirmMeasure(confirmDto: ConfirmMeasureDto) {
    const { measure_uuid, confirmed_value } = confirmDto;
    const measure = await this.measureRepository.findOne({
      where: {
        measureUuid: measure_uuid,
      },
    });

    if (!measure) {
      throw new ConflictException({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Leitura não encontrada',
      });
    }

    if (measure.hasConfirmed) {
      throw new ConflictException({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura do mês já realizada',
      });
    }

    measure.hasConfirmed = true;
    measure.confirmedValue = confirmed_value;
    await this.measureRepository.save(measure);

    return { success: true };
  }

  async listMeasures(customerCode: string, measureType?: string) {
    const query = this.measureRepository
      .createQueryBuilder('measure')
      .where('measure.customerCode = :customerCode', { customerCode });

    if (measureType) {
      if (!['WATER', 'GAS'].includes(measureType.toUpperCase())) {
        throw new BadRequestException({
          error_code: 'INVALID_TYPE',
          error_description: 'Tipo de medição não permitida',
        });
      }

      query.andWhere('LOWER(measure.measureType) = LOWER(:measureType)', {
        measureType,
      });
    }

    const measures = await query.getMany();

    if (!measures.length) {
      throw new NotFoundException({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada',
      });
    }

    return {
      customer_code: customerCode,
      measures: measures.map((m) => ({
        measure_uuid: m.measureUuid,
        measure_datetime: m.measureDateTime,
        measure_type: m.measureType,
        has_confirmed: m.hasConfirmed,
        image_url: m.imageUrl,
      })),
    };
  }
}
