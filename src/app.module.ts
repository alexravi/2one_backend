import { Module, Logger, OnModuleInit, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { User } from './users/entities/user.entity';
import { Recording } from './recordings/entities/recording.entity';
import { Wallet } from './wallets/entities/wallet.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { PayoutRequest } from './payouts/entities/payout-request.entity';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { RecordingsModule } from './recordings/recordings.module';
import { WalletsModule } from './wallets/wallets.module';
import { PayoutsModule } from './payouts/payouts.module';
import { AdminModule } from './admin/admin.module';
import { DatasetsModule } from './datasets/datasets.module';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    UsersModule,
    UploadModule,
    RecordingsModule,
    WalletsModule,
    PayoutsModule,
    AdminModule,
    DatasetsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', '2one_db'),
        entities: [User, Recording, Wallet, Transaction, PayoutRequest],
        synchronize: true,
        logging: ['error', 'warn', 'schema'],
        ssl: configService.get<string>('DB_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit, NestModule {
  private readonly logger = new Logger('DatabaseConnection');

  constructor(private dataSource: DataSource) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

  async onModuleInit() {
    if (this.dataSource.isInitialized) {
      this.logger.log('✅ Database connected successfully');
      this.logger.log(`   Host: ${this.dataSource.options.type === 'postgres' ? (this.dataSource.options as any).host : 'N/A'}`);
      this.logger.log(`   Database: ${this.dataSource.options.database}`);
      this.logger.log(`   SSL: ${(this.dataSource.options as any).ssl ? 'Enabled' : 'Disabled'}`);
    } else {
      this.logger.error('❌ Database connection FAILED');
    }
  }
}

