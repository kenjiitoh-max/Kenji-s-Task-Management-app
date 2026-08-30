from datetime import datetime, timedelta, timezone

import pytest
from pydantic import ValidationError

from app.main import TimeScale, WeightEntry, cutoff_for_time_scale


def test_weight_entry_minimal_fields():
    entry = WeightEntry(timestamp=datetime.now(timezone.utc), weight_kg=70.0)
    assert entry.id is None
    assert entry.body_fat_percentage is None
    assert entry.note is None


def test_weight_entry_full_fields(sample_weight_entry: WeightEntry):
    assert sample_weight_entry.weight_kg == 68.4
    assert sample_weight_entry.body_fat_percentage == 18.2
    assert sample_weight_entry.note == "朝の計測"


@pytest.mark.parametrize("weight_kg", [0, -1, 501])
def test_weight_entry_rejects_out_of_range_weight(weight_kg):
    with pytest.raises(ValidationError):
        WeightEntry(timestamp=datetime.now(timezone.utc), weight_kg=weight_kg)


def test_weight_entry_rejects_invalid_body_fat():
    with pytest.raises(ValidationError):
        WeightEntry(
            timestamp=datetime.now(timezone.utc),
            weight_kg=70.0,
            body_fat_percentage=120.0,
        )


def test_timestamp_is_normalized_to_utc():
    jst = timezone(timedelta(hours=9))
    entry = WeightEntry(timestamp=datetime(2026, 8, 30, 9, 0, tzinfo=jst), weight_kg=70.0)
    assert entry.timestamp == datetime(2026, 8, 30, 0, 0, tzinfo=timezone.utc)
    assert entry.timestamp.tzinfo == timezone.utc


def test_naive_timestamp_is_treated_as_utc():
    entry = WeightEntry(timestamp=datetime(2026, 8, 30, 0, 0), weight_kg=70.0)
    assert entry.timestamp == datetime(2026, 8, 30, 0, 0, tzinfo=timezone.utc)


def test_cutoff_ordering():
    day = cutoff_for_time_scale(TimeScale.DAY)
    week = cutoff_for_time_scale(TimeScale.WEEK)
    year = cutoff_for_time_scale(TimeScale.YEAR)
    assert year < week < day
