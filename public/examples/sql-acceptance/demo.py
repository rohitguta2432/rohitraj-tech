"""Synthetic SQL result checks. Python stdlib only; no model or external database."""

import json
import sqlite3


FILTER = """
WHERE o.status = 'paid' AND o.currency = 'USD'
  AND o.paid_at >= '2026-09-01T00:00:00Z'
  AND o.paid_at < '2026-10-01T00:00:00Z'
"""
QUERIES = {
    "duplicate_join": """
        SELECT COALESCE(SUM(o.total_cents), 0)
        FROM orders o JOIN order_items i ON i.order_id = o.id
    """ + FILTER,
    "distinct_amount": """
        SELECT COALESCE(SUM(DISTINCT o.total_cents), 0)
        FROM orders o JOIN order_items i ON i.order_id = o.id
    """ + FILTER,
    "order_grain": """
        SELECT COALESCE(SUM(o.total_cents), 0) FROM orders o
    """ + FILTER,
}


def connect_fixture():
    connection = sqlite3.connect(":memory:")
    connection.execute("PRAGMA foreign_keys = ON")
    connection.executescript("""
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY, total_cents INTEGER NOT NULL,
            currency TEXT NOT NULL, status TEXT NOT NULL, paid_at TEXT NOT NULL
        );
        CREATE TABLE order_items (
            id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id)
        );
    """)
    # All timestamps have the same UTC ISO format. No timezone conversion here.
    connection.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?)", [
        (1, 10000, "USD", "paid", "2026-09-01T00:00:00Z"),
        (2, 5000, "USD", "paid", "2026-09-15T12:00:00Z"),
        (3, 10000, "USD", "paid", "2026-09-30T23:59:59Z"),
        (4, 9000, "USD", "cancelled", "2026-09-15T12:00:00Z"),
        (5, 1000, "USD", "paid", "2026-10-01T00:00:00Z"),
        (6, 2000, "USD", "paid", "2026-08-31T23:59:59Z"),
        (7, 7000, "EUR", "paid", "2026-09-15T12:00:00Z"),
    ])
    connection.executemany("INSERT INTO order_items VALUES (?, ?)", [
        (1, 1), (2, 1), (3, 2), (4, 3), (5, 4), (6, 5), (7, 6), (8, 7),
    ])
    return connection


def run_demo():
    connection = connect_fixture()
    try:
        # Independent expected result from the agreed fixture: orders 1, 2, 3.
        expected = 25000
        results = []
        for name, query in QUERIES.items():
            actual = connection.execute(query).fetchone()[0]
            results.append({
                "case": name, "actual_cents": actual,
                "expected_cents": expected, "matches_expected": actual == expected,
            })
        return {
            "synthetic": True,
            "metric": "Paid order value in USD, September 2026 UTC, one row per order",
            "results": results,
        }
    finally:
        connection.close()


if __name__ == "__main__":
    print(json.dumps(run_demo(), indent=2))
