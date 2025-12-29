# === Stage 1: Build Stage (ビルド環境) ===
FROM node:20-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係ファイルをコピーし、完全な依存関係をインストール
COPY package*.json ./
RUN npm ci

# PrismaスキーマファイルをコピーしてPrisma Clientを生成
COPY prisma ./prisma
RUN npx prisma generate

# アプリケーションのソースコードをコピーしてビルド
# 一つ目の引数はローカルを指している。
COPY . . 
# 以下コマンドでtypeScriptのコードをjavaScriptに変換している。
RUN npm run build


# === Stage 2: Production Stage (実行環境) ===
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# 本番に必要な依存関係のみをインストール
COPY package*.json ./

# Prisma 7 は自動的に prisma.config.ts を読み込んで実行します
# このファイルはビルド環境で作成したものをコピーしている。
COPY prisma.config.ts ./prisma.config.ts

# --omit=devはdevDependenciesをインストールしないオプション
RUN npm ci --omit=dev && npm cache clean --force

# 【重要】Prismaスキーマと生成されたClientをコピー
# migrate deployを実行するためにschema.prismaが必要
COPY --from=builder /app/prisma ./prisma
# Prisma 7で生成されたクライアントコードとパッケージをコピー
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# ビルド成果物をコピー
# --fromを付けることでコンテナ内からビルド環境の成果物をコピーすることができる。
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma.config.ts ./

# 追加の処理の記載
# スクリプトをコピーして実行権限を与える
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# ポート3000を公開
EXPOSE 3000

# ECSのターゲットグループと整合するヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 上記ヘルスチェックを行う理由

# アプリの異常を検知して、ECSが自動復旧可能

# コンテナ起動 → アプリがクラッシュ
# ↓
# Docker HEALTHCHECK: 「unhealthy」と判定
# ECSヘルスチェック: 「unhealthy」と判定
# ↓
# ECS: タスクを停止 → 新しいタスクを起動
# ↓
# 正常なタスクが動作 → ユーザーリクエストが正常に処理される

# ないとどうなる？
# コンテナは起動しているがアプリが応答しない状態を検知できない
# 不健康なコンテナがALBに登録され続ける可能性がある
# ユーザーにエラーが返り続ける
# ECSの自動復旧が機能しない可能性がある

# NestJSアプリケーションを起動
# CMD ["node", "dist/main"]

# 【重要】マイグレーション-> シードデータ投入-> アプリを起動
# CMD npx prisma migrate deploy && npx prisma db seed && node dist/main

# コンテナ起動時にこのスクリプトを一番最初に実行させる
ENTRYPOINT ["./entrypoint.sh"]

# nodeコマンド　引数にdist/mainを渡すことで、distディレクトリにあるmain.jsを実行する。

# npm run start:prod はnpm run build && node dist/main と同じ意味。
# dependenciesをインストールしないオプションを使用している。
# dependenciesの定義にstart:prod としてnode dist/mainを定義している。 
# どちらの形式で記載しても問題無いが、npm run だと1コマンドクッションして効率が悪い。