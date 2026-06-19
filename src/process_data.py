"""
Copy synthetic sales data to the processed data directory.

`load_data()` prefers `data/processed/sales_clean.csv` when present; run this
after regenerating synthetic data to keep processed and synthetic in sync.
"""

from pathlib import Path

import config
from src.data import load_data


def process_sales_data(
    source: Path = None,
    destination: Path = None,
) -> Path:
    """
    Load, validate, and write cleaned sales data to the processed path.

    Returns:
        Path to the written CSV file.
    """
    source = source or config.SYNTHETIC_DATA_PATH
    destination = destination or config.PROCESSED_DATA_PATH

    if not source.exists():
        raise FileNotFoundError(
            f"Source data not found at {source}. Run `python generate_data.py` first."
        )

    df = load_data(source)
    destination.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(destination, index=False)
    return destination


def main():
    out = process_sales_data()
    print(f"✅ Wrote processed data to {out} ({out.stat().st_size / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main()
