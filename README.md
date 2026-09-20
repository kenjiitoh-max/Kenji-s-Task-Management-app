# My Goals

Expo GoでiPhoneから使える、個人用のタスク・ゴール管理アプリです。認証やバックエンドは使わず、すべてのデータを端末内のSQLiteに保存します。

## 技術スタック

- Expo SDK 57（Managed）
- React Native / TypeScript
- Expo Router
- expo-sqlite（ローカルデータ）
- Reanimated / Haptics / Confetti Cannon

## 主な機能

- 「体重管理」「英語」「Devin」などのカテゴリー管理
- カテゴリーごとの短期・中期・長期ゴール
- 今日のデイリーアクションと完了進捗
- 完了時のハプティクス、アニメーション、紙吹雪、メッセージ
- 全アクション達成時の特別なセレブレーション
- iOSのライト／ダークモード
- 日付が変わると完了状態を自動リセット

## セットアップ

```bash
npm install
npx expo start
```

表示されたQRコードを、同じWi-Fiに接続したiPhoneのExpo Goで読み取ります。ネットワーク制限がある場合は次を使ってください。

```bash
npx expo start --tunnel
```

テスト、型チェック、Lintは次で実行できます。

```bash
npm test
npm run typecheck
npm run lint
```

## プロジェクト構成

```text
app/                  Expo Routerの画面
src/components/       カード、フォーム、セレブレーションUI
src/hooks/             UI用フック
src/db/                SQLite初期化とリポジトリ
__tests__/             SQLiteデータ層テスト
```

## データモデル

- `categories`: カテゴリー名、アクセントカラー、作成日時
- `goals`: カテゴリーに紐づく短期／中期／長期ゴール、説明、目標日
- `daily_actions`: カテゴリーに紐づくアクション、完了状態、完了日時、更新日時

アプリ起動時にテーブルを作成し、初回起動だけ3つのカテゴリーをシードします。外部サーバーにはデータを送信しません。
