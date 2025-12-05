//アプリケーション実行時にPrisma ClientがDBに接続するための設定

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    // Prisma 7では、adapterを使用してPrismaClientを初期化する必要がある
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // super()を呼ぶ前に、必要な変数を準備する
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    // super()を先に呼ぶ必要がある
    super({ adapter });
    
    // super()を呼んだ後に、this.poolに代入する
    this.pool = pool;
  }

  async onModuleInit() {
    // Prisma 7では接続が自動的に行われるため、$connect()は不要
    // 初回クエリ実行時に自動的に接続される
  }

  async onModuleDestroy() {
    // Prisma Clientのクリーンアップ
    // アプリケーション終了時に接続を切断してメモリリークを防止
    try {
      await this.$disconnect();
      await this.pool.end();
    } catch (error) {
      // エラーを無視（既に切断されている場合など）
    }
  }
}

