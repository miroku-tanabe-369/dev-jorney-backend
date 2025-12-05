import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// .envファイルを読み込む（ローカル環境で実行する場合）
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Dockerコンテナ内で動作するため、0.0.0.0にバインドして外部からのアクセスを許可
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
