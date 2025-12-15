import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { Public } from './auth/public.decorator';
import { JwtGuard } from './auth/jwt.guard';

@UseGuards(JwtGuard) //JWT認証をこのコントローラー全体に適応
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 認証不要なエンドポイント（ヘルスチェック用）
   */
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * 認証不要なエンドポイント（ヘルスチェック用）
   */
  @Public()
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  /**
   * 認証不要なエンドポイント（データベース接続テスト用）
   */
  @Public()
  @Get('db-test')
  async testDbConnection() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'connected',
        database: 'devjourney',
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
