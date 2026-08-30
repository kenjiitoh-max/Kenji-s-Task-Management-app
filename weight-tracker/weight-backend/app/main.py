import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Optional

import aiosqlite
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

load_dotenv()

# Database path - use /data/app.db for persistent volume in production
DB_PATH = os.getenv("DB_PATH", "/data/app.db" if os.path.exists("/data") else "app.db")


class TimeScale(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"


class WeightEntry(BaseModel):
    """1回分の体重記録。"""

    id: Optional[int] = None
    timestamp: datetime
    weight_kg: float = Field(gt=0, le=500)
    body_fat_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    note: Optional[str] = None


class WeightEntryCreate(BaseModel):
    """POST /api/weight のリクエストボディ。timestamp は省略時に現在時刻。"""

    timestamp: Optional[datetime] = None
    weight_kg: float = Field(gt=0, le=500)
    body_fat_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    note: Optional[str] = None


async def init_database():
    """SQLite のテーブルを作成する（起動時に毎回呼ばれる）。"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS weight_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                weight_kg REAL NOT NULL,
                body_fat_percentage REAL,
                note TEXT
            )
        """)
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_weight_entries_timestamp
            ON weight_entries(timestamp)
        """)
        # ここに english_logs / workout_logs テーブルを追加して複数ドメインへ拡張できる
        await db.commit()


async def save_weight_entry_to_db(entry: WeightEntry) -> WeightEntry:
    """体重記録を1件保存し、採番された id 付きのモデルを返す。"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("""
            INSERT INTO weight_entries (timestamp, weight_kg, body_fat_percentage, note)
            VALUES (?, ?, ?, ?)
        """, (
            entry.timestamp.isoformat(),
            entry.weight_kg,
            entry.body_fat_percentage,
            entry.note,
        ))
        await db.commit()
        entry_id = cursor.lastrowid
    return entry.model_copy(update={"id": entry_id})


async def get_weight_entries_from_db(cutoff_timestamp: Optional[float] = None) -> list[WeightEntry]:
    """体重記録を古い順に取得する。cutoff_timestamp 以降のみに絞ることもできる。"""
    query = "SELECT * FROM weight_entries"
    params: list = []
    if cutoff_timestamp is not None:
        cutoff_dt = datetime.fromtimestamp(cutoff_timestamp, tz=timezone.utc)
        query += " WHERE timestamp >= ?"
        params.append(cutoff_dt.isoformat())
    query += " ORDER BY timestamp ASC"

    entries: list[WeightEntry] = []
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(query, params) as cursor:
            async for row in cursor:
                entries.append(
                    WeightEntry(
                        id=row["id"],
                        timestamp=datetime.fromisoformat(row["timestamp"]),
                        weight_kg=row["weight_kg"],
                        body_fat_percentage=row["body_fat_percentage"],
                        note=row["note"],
                    )
                )
    return entries


async def delete_weight_entry_from_db(entry_id: int) -> bool:
    """体重記録を1件削除する。削除できたら True。"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("DELETE FROM weight_entries WHERE id = ?", (entry_id,))
        await db.commit()
        return cursor.rowcount > 0


async def count_weight_entries() -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT COUNT(*) FROM weight_entries") as cursor:
            row = await cursor.fetchone()
            return row[0] if row else 0


def cutoff_for_time_scale(time_scale: TimeScale) -> float:
    """time_scale から「これ以降のデータだけ返す」基準時刻(UNIX秒)を計算する。"""
    now = datetime.now(timezone.utc).timestamp()
    if time_scale == TimeScale.DAY:
        return now - 86400
    if time_scale == TimeScale.WEEK:
        return now - 604800
    if time_scale == TimeScale.MONTH:
        return now - 2592000
    return now - 31536000


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_database()
    yield


app = FastAPI(title="Weight Tracker", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/api/weight")
async def create_weight_entry(payload: WeightEntryCreate):
    entry = WeightEntry(
        timestamp=payload.timestamp or datetime.now(timezone.utc),
        weight_kg=payload.weight_kg,
        body_fat_percentage=payload.body_fat_percentage,
        note=payload.note,
    )
    saved = await save_weight_entry_to_db(entry)
    return saved.model_dump()


@app.get("/api/weight")
async def list_weight_entries(time_scale: Optional[TimeScale] = None):
    cutoff = cutoff_for_time_scale(time_scale) if time_scale else None
    entries = await get_weight_entries_from_db(cutoff)
    return {
        "time_scale": time_scale,
        "count": len(entries),
        "entries": [entry.model_dump() for entry in entries],
    }


@app.delete("/api/weight/{entry_id}")
async def delete_weight_entry(entry_id: int):
    deleted = await delete_weight_entry_from_db(entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"status": "ok", "deleted_id": entry_id}


@app.get("/api/status")
async def get_status():
    entries = await get_weight_entries_from_db()
    latest = entries[-1] if entries else None
    return {
        "entries_count": len(entries),
        "latest_weight_kg": latest.weight_kg if latest else None,
        "latest_timestamp": latest.timestamp if latest else None,
        "db_path": DB_PATH,
    }


# 拡張ポイント:
# 英語学習ログや筋トレログを足すときは、上の WeightEntry と同じ流れで
# モデル -> init_database() のテーブル -> save/get 関数 -> エンドポイント
# を1セット追加すればよい。

# Serve frontend static files if the static directory exists.
# Layout under static/:
#   index.html              -> frontend served at "/"
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.is_dir():
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve the frontend at root."""
        file_path = (STATIC_DIR / full_path).resolve()
        if not file_path.is_relative_to(STATIC_DIR.resolve()):
            return FileResponse(STATIC_DIR / "index.html")
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
