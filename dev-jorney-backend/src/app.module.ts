import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SkilltreesModule } from './skilltree/skilltrees.module';
import { QuestsModule } from './quests/quests.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { AuthModule } from './auth/auth.module';
import { AuthorizerGuard } from './auth/jwt.guard';

/**
 * アプリケーションモジュール
 * 
 * 認証の統合:
 * - ConfigModule: 環境変数の読み込み（グローバル設定）
 * - AuthModule: 認証モジュールのインポート
 * - APP_GUARD: グローバルガードとしてJWT Guardを設定
 *   → すべてのエンドポイントがデフォルトで保護される
 *   → @Public()デコレータで認証不要なエンドポイントを指定可能
 */
@Module({
  imports: [
    // 環境変数の読み込み（グローバル設定）
    ConfigModule.forRoot({
      isGlobal: true,        // すべてのモジュールで利用可能
      envFilePath: '.env',   // .envファイルから読み込み
    }),
    // 認証モジュール
    AuthModule,
    // その他のモジュール
    PrismaModule,
    UsersModule,
    SkilltreesModule,
    QuestsModule,
    ChecklistsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // グローバルガードとしてAuthorizerGuardを設定
    // これにより、すべてのエンドポイントがデフォルトで保護される
    {
      provide: APP_GUARD,
      useClass: AuthorizerGuard,
    },
  ],
})
export class AppModule {}

