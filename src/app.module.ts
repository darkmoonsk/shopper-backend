import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MeasuresModule } from './measures/measures.module';
import { GeminiModule } from './gemini/gemini.module';
import { PostgresModule } from './database/postgres.module';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/images',
    }),
    PostgresModule,
    MeasuresModule,
    GeminiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
