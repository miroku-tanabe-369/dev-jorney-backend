#!/bin/sh
set -e

# 個別変数からURLを組み立ててOSに登録
export DATABASE_URL="postgresql://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}"

echo "Starting migration with host: ${DATABASE_HOST}"

# Prisma 7 は自動的に prisma.config.ts を読み込んで実行します
npx prisma migrate deploy --config ./prisma.config.ts

echo "Starting seed data insertion..."
# シードデータを投入（upsertなので既存データは更新される）
# コンパイル済みのJavaScriptファイルを実行

# seed-data.jsonの存在確認
if [ ! -f "prisma/seed-data.json" ]; then
  echo "❌ Error: prisma/seed-data.json not found!"
  echo "💡 Make sure seed-data.json is copied to the container during Docker build"
  exit 1
fi

# seed.jsの存在確認と実行
if [ -f "dist/prisma/seed.js" ]; then
  echo "✅ Found seed.js, executing..."
  echo "📁 Seed data file: $(ls -lh prisma/seed-data.json | awk '{print $5, $9}')"
  
  # set -eを一時的に無効にしてエラーハンドリング
  set +e
  node dist/prisma/seed.js
  SEED_EXIT_CODE=$?
  set -e
  
  if [ $SEED_EXIT_CODE -eq 0 ]; then
    echo "✅ Seed data insertion completed successfully"
  else
    echo "❌ Seed data insertion failed with exit code $SEED_EXIT_CODE"
    echo "⚠️  Continuing application startup despite seed failure..."
    # シードが失敗してもアプリケーションは起動する（既存データがある場合など）
  fi
else
  echo "❌ Error: dist/prisma/seed.js not found!"
  echo "💡 Make sure prisma/seed.ts is compiled during Docker build"
  echo "📁 Checking dist directory:"
  ls -la dist/ || echo "dist directory does not exist"
  ls -la dist/prisma/ 2>/dev/null || echo "dist/prisma directory does not exist"
  exit 1
fi

echo "Starting NestJS application..."
exec node dist/src/main.js