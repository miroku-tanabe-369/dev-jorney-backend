import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

/**
 * 認証モジュール
 * 
 * 役割:
 * - JWT Strategyの提供
 * - 認証関連の依存関係管理
 * 
 * このモジュールをインポートすることで、JWT Strategyが利用可能になります。
 */
@Module({
  imports: [
    // Passportモジュール（認証ストラテジーに必要）
    PassportModule,
    // Configモジュール（環境変数の取得に必要）
    ConfigModule,
  ],
  providers: [
    // JWT Strategy（JWTトークン検証ロジック）
    JwtStrategy,
  ],
  exports: [
    // 他のモジュールでJWT Strategyを使用できるようにエクスポート
    JwtStrategy,
  ],
})
export class AuthModule {}
