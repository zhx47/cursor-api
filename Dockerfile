# Node.jsの軽量版Alpine Linuxベースイメージを使用
FROM node:lts-alpine

# アプリケーションのポート3000を公開
EXPOSE 3000

# アプリケーションのワーキングディレクトリを/appに設定
WORKDIR /app

# パフォーマンス最適化：package.jsonとpackage-lock.jsonを先にコピー
COPY package*.json ./

# npmインストールを実行
RUN npm ci

# アプリケーションのソースコードを後でコピー（レイヤーキャッシュ最適化）
COPY . .

# コンテナのタイムゾーンを東京に設定
ENV TZ=Asia/Tokyo

# アプリケーションを起動するコマンドを設定
CMD ["npm", "run", "start"]