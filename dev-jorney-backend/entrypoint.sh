#!/bin/sh
set -e

# 個別変数からURLを組み立ててOSに登録
export DATABASE_URL="postgresql://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}"

echo "Starting migration with host: ${DATABASE_HOST}"

# Prisma 7 は自動的に prisma.config.ts を読み込んで実行します
npx prisma migrate deploy --config ./prisma.config.ts

echo "Starting NestJS application..."
exec node dist/src/main.js