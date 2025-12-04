import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

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
