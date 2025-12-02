# === Stage 1: Build Stage (ビルド環境) ===
FROM node:20-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係ファイルをコピーし、完全な依存関係をインストール
COPY package*.json ./
RUN npm ci

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
# --omit=devはdevDependenciesをインストールしないオプション
RUN npm ci --omit=dev && npm cache clean --force

# ビルド成果物をコピー
# --fromを付けることでコンテナ内からビルド環境の成果物をコピーすることができる。
COPY --from=builder /app/dist ./dist

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
CMD ["node", "dist/main"]

# nodeコマンド　引数にdist/mainを渡すことで、distディレクトリにあるmain.jsを実行する。

# npm run start:prod はnpm run build && node dist/main と同じ意味。
# dependenciesをインストールしないオプションを使用している。
# dependenciesの定義にstart:prod としてnode dist/mainを定義している。 
# どちらの形式で記載しても問題無いが、npm run だと1コマンドクッションして効率が悪い。