import os
from datetime import datetime, timezone
from typing import AsyncGenerator

import pytest
from fastapi.testclient import TestClient

from app.main import WeightEntry, app, init_database


@pytest.fixture
def temp_db_path(tmp_path) -> str:
    return str(tmp_path / "test.db")


@pytest.fixture
async def test_db(temp_db_path: str) -> AsyncGenerator[str, None]:
    """テスト中だけ DB_PATH を一時ファイルに差し替える。"""
    import app.main as main_module

    original_db_path = main_module.DB_PATH
    original_env = os.environ.get("DB_PATH")

    main_module.DB_PATH = temp_db_path
    os.environ["DB_PATH"] = temp_db_path

    await init_database()

    yield temp_db_path

    main_module.DB_PATH = original_db_path
    if original_env is None:
        os.environ.pop("DB_PATH", None)
    else:
        os.environ["DB_PATH"] = original_env


@pytest.fixture
def client(test_db) -> TestClient:
    return TestClient(app)


@pytest.fixture
def sample_weight_entry() -> WeightEntry:
    return WeightEntry(
        timestamp=datetime.now(timezone.utc),
        weight_kg=68.4,
        body_fat_percentage=18.2,
        note="朝の計測",
    )
