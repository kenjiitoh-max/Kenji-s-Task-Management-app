# 体重管理アプリ（学習用スターター）

FastAPI + SQLite(aiosqlite) + 単一 HTML フロントエンドという「縦串」が一通り揃った、
自分で改良していくための最小構成アプリです。`temp-master` の `switchbot-dashboard` を手本に、
外部 API 連携を取り除き、手入力した体重を記録・可視化するだけの形にしています。

## 構成

```
weight-tracker/
  weight-backend/     FastAPI + SQLite（REST API）
    app/main.py       モデル・DB・エンドポイントが全部入った1ファイル
    tests/            pytest（モデル / DB / API）
  weight-frontend/
    index.html        単一 HTML + CDN（jQuery, Chart.js, Bootstrap）
  Dockerfile          バックエンドを起動し、フロントを静的配信する
```

## ローカルでの起動

### バックエンド

```bash
cd weight-backend
cp .env.example .env          # DB_PATH を変えたいときだけ編集
poetry install
poetry run fastapi dev app/main.py
```

- Python 3.12 が必要です（`poetry env use python3.12` で切り替えられます）
- 起動後 http://localhost:8000/healthz が `{"status": "ok"}` を返せば OK
- API ドキュメント: http://localhost:8000/docs

### フロントエンド

`weight-frontend/index.html` をブラウザで直接開くだけです（ビルド不要）。
`file://` で開いた場合は `http://localhost:8000` のバックエンドを呼びます。

バックエンドから配信したい場合は、フロントを `weight-backend/static/` に置きます。

```bash
cp -r weight-frontend weight-backend/static
```

その状態でバックエンドを起動すると http://localhost:8000/ で画面が開きます
（Docker イメージも同じ仕組みです）。

### テスト

```bash
cd weight-backend
poetry run pytest
```

## API エンドポイント

| メソッド | パス | 説明 |
| --- | --- | --- |
| `POST` | `/api/weight` | 体重を1件記録（`weight_kg` 必須、`timestamp` / `body_fat_percentage` / `note` は任意） |
| `GET` | `/api/weight` | 記録一覧を古い順で返す。`time_scale=day\|week\|month\|year` で期間フィルタ |
| `DELETE` | `/api/weight/{entry_id}` | 記録を1件削除 |
| `GET` | `/api/status` | 記録件数・最新の体重などのステータス |
| `GET` | `/healthz` | ヘルスチェック |

リクエスト例:

```bash
curl -X POST http://localhost:8000/api/weight \
  -H 'Content-Type: application/json' \
  -d '{"weight_kg": 68.4, "body_fat_percentage": 18.2, "note": "朝の計測"}'

curl http://localhost:8000/api/weight
```

## Docker

```bash
docker build -t weight-tracker .
docker run -p 8000:8000 -v $(pwd)/data:/data weight-tracker
```

`/data` をボリュームにすると SQLite の中身が残ります（`DB_PATH` の既定値が `/data/app.db` になります）。

## 学習ロードマップ

このスターターを起点に、少しずつ「縦串」を太くしていくのがおすすめです。

1. **まず触る**: 体重を数日分入れて、グラフとテーブルの挙動を確認する
2. **API を1本足す**: 例）`GET /api/weight/summary` で週平均を返す。モデル → DB 関数 → エンドポイント → テストの順で書く
3. **フロントを足す**: `index.html` に目標体重の線を引く、移動平均を重ねる、など
4. **複数ドメインへ拡張する**: `app/main.py` の `init_database()` にある
   「# ここに english_logs / workout_logs テーブルを追加して複数ドメインへ拡張できる」
   のコメント位置に、英語学習ログ（学習時間・教材・スコア）や筋トレログ（種目・重量・回数）の
   テーブルとモデルを追加する。体重と同じパターンをもう一度なぞるだけで、
   「1つのアプリで複数の習慣を記録するダッシュボード」に育つ
5. **デプロイする**: Dockerfile をそのまま使って Fly.io などに載せ、どこからでも記録できるようにする
6. **CI を足す**: GitHub Actions で `poetry run pytest` を回す

各ステップで必ずテストを1つ足すと、「壊さず改良できる」感覚が身につきます。
