import { DataSource } from 'typeorm';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        try {
          const dataSource = new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'shopper',
            entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
            synchronize: true,
          });

          await dataSource.initialize();
          console.log('Conexão com o banco de dados estabelecida com sucesso');
          return dataSource;
        } catch (error) {
          console.error('Erro ao conectar ao banco de dados:', error);
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class PostgresModule {}
