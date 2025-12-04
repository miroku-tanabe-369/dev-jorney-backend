//アプリケーション実行時にPrisma ClientがDBに接続するための設定

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Prisma 7では、DATABASE_URL環境変数が自動的に読み込まれるため、
    // datasourcesを明示的に指定する必要はない
    // 環境変数DATABASE_URLが設定されていれば、Prisma Clientは自動的にそれを使用する
    super();
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
    } catch (error) {
      // エラーを無視（既に切断されている場合など）
    }
  }
}

