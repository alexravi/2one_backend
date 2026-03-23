import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors();

  // Swagger / OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('2une Voice Data Collection API')
    .setDescription(
      'Backend API for the 2une voice data collection platform. ' +
      'Users upload phone call recordings and get paid for approved audio.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addTag('Auth', 'User registration & authentication')
    .addTag('Upload', 'Audio file upload via Azure Blob presigned URLs')
    .addTag('Recordings', 'Recording registration & metadata')
    .addTag('Payouts', 'Wallet balance, transactions & payout requests')
    .addTag('Admin', 'Admin moderation panel')
    .addTag('Datasets', 'Dataset export for clients')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application running on: ${await app.getUrl()}`);
  console.log(`Swagger docs available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
