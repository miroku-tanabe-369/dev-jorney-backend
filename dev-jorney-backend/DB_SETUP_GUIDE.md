# データベース接続とマイグレーション設定ガイド

## ステップ1: 必要なパッケージのインストール

```bash
cd backend/dev-jorney-backend
npm install @nestjs/typeorm typeorm pg
npm install --save-dev @types/pg
```

## ステップ2: TypeORMモジュールの設定

### 2-1. AppModuleにTypeORMを追加

`src/app.module.ts`を以下のように修正：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development', // 開発環境のみ自動同期
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## ステップ3: データベース接続の確認

### 3-1. アプリケーションを起動

```bash
# Docker Composeでバックエンドも起動
docker-compose up -d

# ログを確認
docker-compose logs -f backend
```

### 3-2. 接続成功の確認

ログに以下のようなメッセージが表示されれば成功：
```
[Nest] LOG [TypeOrmModule] Successfully connected to database
```

### 3-3. 接続テストエンドポイントの作成（オプション）

`src/app.controller.ts`に接続テストエンドポイントを追加：

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectDataSource() private dataSource: DataSource,
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
  async testDb() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'connected', database: this.dataSource.options.database };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
```

接続確認：
```bash
curl http://localhost:3000/db-test
# 期待される出力: {"status":"connected","database":"devjourney"}
```

## ステップ4: マイグレーションの設定

### 4-1. TypeORM設定ファイルの作成

プロジェクトルートに`ormconfig.ts`を作成：

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // マイグレーションを使用するためfalse
});
```

### 4-2. package.jsonにマイグレーションスクリプトを追加

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:run": "npm run typeorm -- migration:run -d ormconfig.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d ormconfig.ts"
  }
}
```

### 4-3. 最初のエンティティとマイグレーションの作成

#### エンティティの作成例

`src/users/user.entity.ts`を作成：

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
```

#### マイグレーションの生成

```bash
# コンテナ内で実行
docker exec -it dev-jorney-backend npm run migration:generate -- src/migrations/CreateUsers
```

または、ローカルで実行（node_modulesがインストールされている場合）：

```bash
npm run migration:generate -- src/migrations/CreateUsers
```

#### マイグレーションの実行

```bash
# コンテナ内で実行
docker exec -it dev-jorney-backend npm run migration:run

# または、ローカルで実行
npm run migration:run
```

## ステップ5: 動作確認

### 5-1. テーブルが作成されたか確認

```bash
docker exec -it dev-jorney-postgres psql -U postgres -d devjourney

# psql内で実行
\dt
# usersテーブルが表示されれば成功
```

### 5-2. アプリケーションからDB操作を確認

エンティティを使用したAPIエンドポイントを作成して動作確認。

## トラブルシューティング

### 接続エラーが発生する場合

1. 環境変数が正しく設定されているか確認
   ```bash
   docker exec -it dev-jorney-backend env | grep DATABASE
   ```

2. PostgreSQLコンテナが起動しているか確認
   ```bash
   docker-compose ps
   ```

3. ネットワーク接続を確認
   ```bash
   docker exec -it dev-jorney-backend ping postgres
   ```

### マイグレーションエラーが発生する場合

1. マイグレーションファイルの構文を確認
2. データベースの状態を確認
3. 必要に応じてマイグレーションをロールバック

