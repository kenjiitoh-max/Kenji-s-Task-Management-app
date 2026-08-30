from fastapi.testclient import TestClient


def test_healthz(client: TestClient):
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_post_then_get_weight(client: TestClient):
    response = client.post("/api/weight", json={"weight_kg": 68.4, "note": "朝の計測"})
    assert response.status_code == 200
    created = response.json()
    assert created["id"] is not None
    assert created["weight_kg"] == 68.4

    response = client.get("/api/weight")
    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 1
    assert body["entries"][0]["note"] == "朝の計測"


def test_get_weight_with_time_scale(client: TestClient):
    client.post("/api/weight", json={"weight_kg": 68.4})
    client.post(
        "/api/weight",
        json={"weight_kg": 75.0, "timestamp": "2000-01-01T00:00:00+00:00"},
    )

    body = client.get("/api/weight", params={"time_scale": "week"}).json()
    assert body["count"] == 1
    assert body["entries"][0]["weight_kg"] == 68.4


def test_entries_with_mixed_offsets_are_ordered_by_real_time(client: TestClient):
    # 実時刻は 2026-08-29T15:00Z（後） と 2026-08-29T12:00Z（先）
    client.post("/api/weight", json={"weight_kg": 70.0, "timestamp": "2026-08-30T00:00:00+09:00"})
    client.post("/api/weight", json={"weight_kg": 71.0, "timestamp": "2026-08-29T07:00:00-05:00"})

    entries = client.get("/api/weight").json()["entries"]
    assert [e["weight_kg"] for e in entries] == [71.0, 70.0]
    assert client.get("/api/status").json()["latest_weight_kg"] == 70.0


def test_post_weight_validation_error(client: TestClient):
    assert client.post("/api/weight", json={"weight_kg": -5}).status_code == 422


def test_delete_weight(client: TestClient):
    entry_id = client.post("/api/weight", json={"weight_kg": 68.4}).json()["id"]

    assert client.delete(f"/api/weight/{entry_id}").status_code == 200
    assert client.get("/api/weight").json()["count"] == 0
    assert client.delete(f"/api/weight/{entry_id}").status_code == 404


def test_status(client: TestClient):
    client.post("/api/weight", json={"weight_kg": 68.4})

    body = client.get("/api/status").json()
    assert body["entries_count"] == 1
    assert body["latest_weight_kg"] == 68.4
