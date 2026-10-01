from datetime import datetime, timedelta, timezone

from app.main import (
    WeightEntry,
    count_weight_entries,
    delete_weight_entry_from_db,
    get_weight_entries_from_db,
    save_weight_entry_to_db,
)


async def test_insert_and_read(test_db, sample_weight_entry: WeightEntry):
    saved = await save_weight_entry_to_db(sample_weight_entry)
    assert saved.id is not None

    entries = await get_weight_entries_from_db()
    assert len(entries) == 1
    assert entries[0].weight_kg == sample_weight_entry.weight_kg
    assert entries[0].note == sample_weight_entry.note


async def test_entries_are_sorted_ascending(test_db):
    now = datetime.now(timezone.utc)
    await save_weight_entry_to_db(WeightEntry(timestamp=now, weight_kg=70.0))
    await save_weight_entry_to_db(WeightEntry(timestamp=now - timedelta(days=2), weight_kg=71.0))

    entries = await get_weight_entries_from_db()
    assert [e.weight_kg for e in entries] == [71.0, 70.0]


async def test_cutoff_filters_old_entries(test_db):
    now = datetime.now(timezone.utc)
    await save_weight_entry_to_db(WeightEntry(timestamp=now, weight_kg=70.0))
    await save_weight_entry_to_db(WeightEntry(timestamp=now - timedelta(days=10), weight_kg=72.0))

    cutoff = (now - timedelta(days=1)).timestamp()
    entries = await get_weight_entries_from_db(cutoff)
    assert len(entries) == 1
    assert entries[0].weight_kg == 70.0


async def test_delete_entry(test_db, sample_weight_entry: WeightEntry):
    saved = await save_weight_entry_to_db(sample_weight_entry)

    assert await delete_weight_entry_from_db(saved.id) is True
    assert await count_weight_entries() == 0
    assert await delete_weight_entry_from_db(saved.id) is False
