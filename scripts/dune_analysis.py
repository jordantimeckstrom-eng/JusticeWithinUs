#!/usr/bin/env python3
"""Run a Dune query and save results for lightweight analytics automation."""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API_BASE = "https://api.dune.com/api/v1"


def request_json(url: str, api_key: str, method: str = "GET", payload: dict | None = None) -> dict:
    data = None
    headers = {
        "X-Dune-API-Key": api_key,
        "Content-Type": "application/json",
    }

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url=url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {exc.code} calling {url}: {body}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Network error calling {url}: {exc}") from exc


def start_execution(query_id: int, api_key: str, parameters: dict) -> str:
    payload = {"query_parameters": parameters}
    response = request_json(
        f"{API_BASE}/query/{query_id}/execute",
        api_key,
        method="POST",
        payload=payload,
    )
    execution_id = response.get("execution_id")
    if not execution_id:
        raise RuntimeError(f"Missing execution_id in response: {response}")
    return execution_id


def wait_for_results(execution_id: str, api_key: str, poll_seconds: int, timeout_seconds: int) -> dict:
    status_url = f"{API_BASE}/execution/{execution_id}/status"
    result_url = f"{API_BASE}/execution/{execution_id}/results"

    start = time.time()
    while True:
        status_response = request_json(status_url, api_key)
        state = status_response.get("state", "UNKNOWN")

        if state == "QUERY_STATE_COMPLETED":
            return request_json(result_url, api_key)

        if state in {"QUERY_STATE_FAILED", "QUERY_STATE_CANCELLED", "QUERY_STATE_EXPIRED"}:
            raise RuntimeError(f"Query execution ended with state {state}: {status_response}")

        if time.time() - start > timeout_seconds:
            raise TimeoutError(f"Timed out waiting for execution {execution_id} after {timeout_seconds}s")

        time.sleep(poll_seconds)


def write_results(rows: list[dict], output_csv: Path) -> None:
    output_csv.parent.mkdir(parents=True, exist_ok=True)

    if not rows:
        output_csv.write_text("", encoding="utf-8")
        return

    fieldnames = sorted({key for row in rows for key in row.keys()})
    with output_csv.open("w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def parse_parameters(raw: str | None) -> dict:
    if not raw:
        return {}
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid --parameters JSON: {exc}") from exc
    if not isinstance(parsed, dict):
        raise ValueError("--parameters JSON must be an object")
    return parsed


def main() -> int:
    parser = argparse.ArgumentParser(description="Execute a Dune query and export results to CSV.")
    parser.add_argument("--query-id", type=int, required=True, help="Dune query ID")
    parser.add_argument(
        "--parameters",
        type=str,
        default=None,
        help='Optional JSON query parameters, e.g. {"wallet":"0x..."}',
    )
    parser.add_argument("--poll-seconds", type=int, default=5, help="Polling interval")
    parser.add_argument("--timeout-seconds", type=int, default=300, help="Execution timeout")
    parser.add_argument("--output-csv", type=Path, default=Path("artifacts/dune_results.csv"))
    parser.add_argument("--output-json", type=Path, default=Path("artifacts/dune_results.json"))
    args = parser.parse_args()

    api_key = os.getenv("DUNE_API_KEY")
    if not api_key:
        print("DUNE_API_KEY environment variable is required", file=sys.stderr)
        return 2

    parameters = parse_parameters(args.parameters)

    execution_id = start_execution(args.query_id, api_key, parameters)
    results = wait_for_results(execution_id, api_key, args.poll_seconds, args.timeout_seconds)

    rows = results.get("result", {}).get("rows", [])
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(results, indent=2), encoding="utf-8")
    write_results(rows, args.output_csv)

    print(f"Execution ID: {execution_id}")
    print(f"Rows returned: {len(rows)}")
    print(f"JSON output: {args.output_json}")
    print(f"CSV output: {args.output_csv}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
