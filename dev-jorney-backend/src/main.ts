import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// .envファイルを読み込む（ローカル環境で実行する場合）
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // JSONレスポンスで日本語を正しく表示するための設定
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });
  
  // グローバルなバリデーションパイプを設定
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOに定義されていないプロパティを自動的に削除
      forbidNonWhitelisted: true, // 許可されていないプロパティが含まれている場合、エラーを返す
      transform: true, // リクエストのペイロードをDTOインスタンスに自動変換
    }),
  );
  
  // Dockerコンテナ内で動作するため、0.0.0.0にバインドして外部からのアクセスを許可
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
