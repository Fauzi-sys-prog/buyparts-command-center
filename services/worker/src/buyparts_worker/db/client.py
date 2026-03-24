from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

import psycopg
from psycopg.rows import dict_row

from buyparts_worker.config import WorkerSettings


@contextmanager
def db_connection(settings: WorkerSettings | None = None) -> Iterator[psycopg.Connection]:
    resolved_settings = settings or WorkerSettings.from_env()

    if not resolved_settings.postgres_url:
        raise RuntimeError("POSTGRES_URL is not configured.")

    with psycopg.connect(resolved_settings.postgres_url, row_factory=dict_row) as connection:
        yield connection
