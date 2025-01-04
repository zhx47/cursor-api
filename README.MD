# cursor-api

Cursor エディタを OpenAI 互換の API インターフェースサービスに変換します。

## プロジェクト概要

このプロジェクトは、Cursor エディタの AI 機能を OpenAI API 互換のインターフェースに変換するプロキシサービスを提供し、他のアプリケーションで Cursor の AI 機能を再利用できるようにします。

## 使用前の準備

1. [www.cursor.com](https://www.cursor.com) にアクセスして登録・ログインを完了させます（無料版Hobbyプランでは以下が利用可能）
   - 2000回のコンプリーション
   - 50回の低速プレミアムリクエスト
2. ブラウザで開発者ツール（F12）を開きます
3. アプリケーション-Cookies から `WorkosCursorSessionToken` の値を見つけて保存します（OpenAI のAPIキーに相当）

## API 仕様

### 基本設定

- エンドポイント：`http://localhost:3000/v1/chat/completions`
- リクエストメソッド：POST
- 認証方式：Bearer Token（WorkosCursorSessionToken の値を使用、カンマ区切りでの複数キー入力に対応）

### リクエスト形式とレスポンス形式は OpenAI に準拠

リクエスト例：
```json
{
  "model": "claude-3.5-soonet",
  "messages": [
    {
      "role": "user",
      "content": "こんにちは"
    }
  ],
  "stream": false
}
```

必須フィールド：
- `model`: 使用するモデル名
- `messages`: メッセージの配列

## 本番環境へのデプロイ

### 方法2：Docker でのデプロイ

```bash
docker run -d --name cursor-api -e x-cursor-checksum=xxxxxx -p 3000:3000 zhx47/cursor-api:latest
```

> x-cursor-checksumは、Cursorのリクエストで使用される認証用のチェックサム値です。
> - ブラウザの開発者ツールのNetworkタブで、Cursorへのリクエストヘッダーから `x-cursor-checksum` の値を確認できます
> - 設定は任意です。設定しない場合は自動的にランダムな値が生成されます
> - 優先順位：
>   1. リクエストヘッダーの x-cursor-checksum
>   2. 環境変数の x-cursor-checksum
>   3. ランダム生成された値

## ローカル開発

```bash
cd cursor-api
npm install
npm run dev
```

## 注意事項

- WorkosCursorSessionToken は他人に漏らさないよう、適切に管理してください
- このプロジェクトは学習・研究目的のみで使用し、Cursor の利用規約を遵守してください
- プレミアムモデル（GPT-4、GPT-4o、Claude 3.5 Sonnet）の使用には制限があります
- 制限を超えた場合、アップグレードを求められる場合があります

## オリジナルプロジェクト

- このプロジェクトは [cursorToApi](https://github.com/luolazyandlazy/cursorToApi) プロジェクトを最適化したものです。原作者の貢献に感謝いたします

## ライセンス

MIT License
