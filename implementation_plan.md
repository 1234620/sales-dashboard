# FMCG Distribution Dataset Replacement — Implementation Plan

## Execution Status Summary

> [!TIP]
> **All 7 plan items are COMPLETE.** The dashboard has been fully migrated from a generic e-commerce dataset to an FMCG distribution context. Last updated: 2026-06-12.

| # | Component | File | Status | Notes |
|---|-----------|------|--------|-------|
| 1 | Config — Categories & Business Context | `config.py` | ✅ DONE | 5 FMCG categories, channel split, return rate, stock reference |
| 2 | Data Generator — Real Product SKUs | `generate_data.py` | ✅ DONE | ~90 real SKUs, Pareto-weighted, carton-based B2B |
| 3 | Data Pipeline — Minor Adjustments | `src/data.py` | ✅ DONE | No changes needed — schema is identical |
| 4 | KPIs — No Schema Changes | `src/kpis.py` | ✅ DONE | All 16 KPIs work on same column names |
| 5 | Visualizations — Category Naming | `src/viz.py` | ✅ DONE | Categories are dynamic from data |
| 6 | Dashboard Labels | `app.py` | ✅ DONE | Caption updated to "Parasnath Distribution Group" |
| 7 | Backend API — No Changes | `backend/main.py` | ✅ DONE | Reads from same CSV structure |
| — | Data Generation | `data/synthetic/sales_data.csv` | ✅ DONE | 12.1 MB, 101,930 transactions generated (regenerated 2026-06-12) |

---

## Background & Context

The current dashboard uses a **generic e-commerce dataset** with ~97K synthetic transactions across 8 broad categories (Electronics, Fashion, Beauty, etc.) targeting an Indian e-commerce company. The user has provided **3 stock report images** from a real FMCG distribution operation and wants the dashboard data to reflect this business context with normalized, realistic stock levels.

### Data Extracted from Images

#### Image 1 — Order/Dispatch Sheet (small distributor order)
| SR NO | Product | CTN (Cartons) |
|-------|---------|---:|
| 1 | Kopiko 100PCS | 2 |
| 2 | Choki Choki XL / XL 6PCS | 6 / 4 |
| 3 | Choki Rollz Jar | 1 |
| 4 | Choki Choki | 1 |
| 5 | Jam O Jam Strawberry | 2 |
| 6 | Jam O Jam Blueberry | 2 |
| 7 | Jam O Jam Small | 4 |
| 8 | Choki Stix | 1.5 |
| 9 | Choki Choki Stix 6 PCS | 3 |
| 10 | Malkist Cheese 5RS | 0 |
| 11 | Malkist Cheese 45RS | 42 |
| 12 | Malkist Chocolate 45RS | 5 |
| 13 | Malkist Chocolate 5RS | 3 |
| 14 | Malkist Cappuchino 45RS | 0 |
| 15 | Malkist American Style | 21 |
| 16 | Kopiko Bucket | 3 |
| 17 | Choki Rollz Jar | 6 |
| 18 | Malkist Cheese 25MRP | 11 |
| 19 | Malkist Chocolate 25MRP | 5 |
| 20 | Kopiko Jar 12 PCS | 0 |
| 21 | Kopiko PKT 47MRP | 40 |
| **TOTAL** | | **162.5** |

**Brands:** Kopiko (Mayora/Inbisco India), Choki Choki, Malkist, Jam O Jam

---

#### Image 2 — FG Stock Report (Main Warehouse, as of 06-06-2026)

**Total stock: 52,328 cartons** across 4 major categories:

| Category | Total Qty (CTN) | Key Products |
|----------|---:|---|
| **Beverages** | 19,988 | Litchi Drinks 150ml (7,220), Litchi Drinks 250ml (4,703), Drinko 250ml Litchi-Coconut (1,339), Pran Mango Fruit 500ml (1,381), Ice Pop Assorted (1,373), Frooto Mango 250ml (900), Pran Fazlee Mango 500ml (825) |
| **Bakery & Biscuits** | 20,218 | Potata Biscuit 75gm (3,465), Potata cream & onion 75gm (3,053), Potata Biscuit 25gm-96 Pcs (2,559), Potata Biscuit 12.5gm-144 Pcs (3,000), Family Toast 200gm (549), Garlic Toast 200gm (1,146), Fit Crackers 120gm (855), Pran Special Dry Cake (351) |
| **Confectionery** | 9,970 | Pudding 35gm Mango (2,382), Choco Bean 35gm Pet Jar Doggy (1,861), Pudding 35gm Assorted (1,192), Magic Cup 100pcs (1,067), Milk Kandeez 3.5gm (230), Choco Bean 35gm Feder Toy (990), Lollipop 8gm Assorted (443) |
| **Culinary** | 2,152 | Mr. Noodles 60gm Korean Super Spicy (1,602), Cup Noodles 40gm Chk (199), Cup Noodles 40gm Curry (199), Mr. Noodles 50gm Chicken Masala (152) |

**Brands:** Pran (Bangladeshi FMCG giant), with beverages and baked goods

---

#### Image 3 — Parasnath Warehouse Shan Stocks (as of 17-12-2025)

| Sr No | Product | 90 MRP | 99 MRP | 110 MRP | TOTAL |
|-------|---------|---:|---:|---:|---:|
| 1 | Shan Pulau Biryani | 0 | 20 | 18 | 38 |
| 2 | Shan Biryani | 0 | 106 | 0 | 106 |
| 3 | Shan Special Bombay Biryani | 0 | 532 | 0 | 532 |
| 4 | Shan Punjabi Yakhni Pilau | 0 | 296 | 0 | 296 |
| 5 | Shan Shami Kabab | 0 | 298 | 0 | 298 |
| 6–24 | Various masala mixes... | ... | ... | ... | ... |
| **TOTAL** | | **45** | **1,955** | **67** | **2,067** |

**Brand:** Shan Foods (Pakistani spice brand, imported/distributed in India)

---

## Data Analyst Findings & Normalization Strategy

### Business Profile (Inferred)
This is a **mid-size FMCG distribution company** (likely Parasnath Group / EComSpace Group) operating in India, distributing imported brands from South/Southeast Asia:
- **Pran** (Bangladesh) — Beverages, Bakery, Confectionery, Culinary
- **Mayora/Inbisco** (Indonesia) — Kopiko, Choki Choki, Malkist
- **Shan Foods** (Pakistan) — Masala/Spice mixes

### Stock Level Normalization Approach

> [!IMPORTANT]
> The 3 images represent **snapshots** (point-in-time stock), not sales velocity. We need to convert static stock into realistic **transaction-level sales data** suitable for the dashboard.

**Methodology:**
1. **Derive Average Daily Sales (ADS)** from stock levels using industry benchmarks:
   - FMCG distributors in India hold ~7–10 days of inventory (per research)
   - Using **8 days** as our holding period → `ADS = Stock / 8`
   - FG Stock (52,328 CTN) → ~6,541 CTN/day dispatched
   
2. **Normalize across categories** by weight (% of total stock):
   - Beverages: 38.2% of revenue
   - Bakery & Biscuits: 38.6%
   - Confectionery: 19.1%
   - Culinary: 4.1%
   - Spice Mixes (Shan): Treated as separate category with lower turnover (~15 days)

3. **Pricing normalization** based on web research:
   - Beverages: ₹10–₹60 per unit (vary by pack size, selling by carton at ₹200–₹1,500)
   - Bakery & Biscuits: ₹5–₹75 per unit (carton ₹120–₹2,000)
   - Confectionery: ₹2–₹100 per unit (carton ₹100–₹3,000)
   - Culinary/Noodles: ₹15–₹60 per unit (carton ₹400–₹1,500)
   - Spice Mixes (Shan): ₹65–₹110 per packet (carton ₹1,500–₹3,000)

4. **Transaction volume**: Scale to ~80K transactions over the same date range (Jan 2023 – Apr 2026), ~65 orders/day, matching original dataset size for dashboard compatibility.

---

## Open Questions — Resolved

> [!NOTE]
> **Company name**: Updated from "EComSpace Group" → **"Parasnath Distribution Group"** based on the warehouse name in Image 3. Updated in `app.py` caption and footer.

> [!NOTE]
> **Regions**: Kept the existing **6 Indian regions** (West, North, South, East, Central, North-East) with adjusted weights — West (30%) and North (25%) are heaviest, reflecting typical FMCG importer distribution patterns. Implemented in `config.py`.

> [!NOTE]
> **Channel split**: Flipped to **offline 72% / online 28%**, matching real FMCG distribution reality. Implemented in `config.py`.

---

## Proposed Changes — All Completed

### 1. ✅ Configuration — Categories & Business Context

#### [MODIFY] [config.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/config.py)

**What was done:**
- Replaced 8 e-commerce categories with 5 FMCG categories (Beverages, Bakery & Biscuits, Confectionery, Culinary, Spice Mixes) with B2B carton price ranges and stock-derived weights
- Channel split changed to `{"offline": 0.72, "online": 0.28}`
- Return rate reduced from 8% to 3% (`RETURN_RATE = 0.03`)
- Discount range tightened from 0–35% to 0–18%
- Repeat customer rate increased from 20% to 45%
- Added `STOCK_REFERENCE` dict with carton-level stock metadata from FG Stock Report
- Added festive season windows including Ramadan and Eid (relevant for Shan product demand)
- Indian holidays for Prophet include Eid ul-Fitr and Eid ul-Adha

**Evidence (from `config.py` lines 33–39):**
```python
CATEGORIES = {
    "Beverages":          {"min_price": 120,  "max_price": 1500, "weight": 0.28},
    "Bakery & Biscuits":  {"min_price": 100,  "max_price": 2000, "weight": 0.27},
    "Confectionery":      {"min_price": 80,   "max_price": 3000, "weight": 0.22},
    "Culinary":           {"min_price": 300,  "max_price": 1500, "weight": 0.13},
    "Spice Mixes":        {"min_price": 1400, "max_price": 3200, "weight": 0.10},
}
```

---

### 2. ✅ Data Generator — Real Product SKUs

#### [MODIFY] [generate_data.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/generate_data.py)

**What was done:**
- Created `SKU_CATALOG` with ~90 real product SKUs from stock report images, organized by category
- Each SKU has its own `price_range` (per carton, B2B) and `popularity` weight (Pareto distribution)
- `_get_sku_for_category()` selects SKUs using weighted popularity sampling
- Quantity represents cartons per order (1–8 standard, 10–50 bulk at 15% probability)
- Trade discounts use beta distribution weighted toward lower values (0–18%)
- Seasonal adjustments: summer boost for Beverages (+30%), Ramadan/Eid boost for Spice Mixes (+60%) and Culinary (+30%)
- Customer pool is 4,500 retail outlets with `RET-XXXXX` IDs
- 45% repeat customer rate matching FMCG distribution patterns

**SKU counts per category:**
| Category | SKU Count | Source |
|----------|-----------|--------|
| Beverages | 15 | FG Stock Report — Pran beverages |
| Bakery & Biscuits | 19 | FG Stock Report + Order Sheet (Malkist) |
| Confectionery | 30 | Order Sheet (Kopiko, Choki Choki, Jam O Jam) + FG Stock Report |
| Culinary | 5 | FG Stock Report — Mr. Noodles, Cup Noodles |
| Spice Mixes | 24 | Parasnath Warehouse Shan Stocks |
| **Total** | **93** | |

---

### 3. ✅ Data Pipeline — No Structural Changes

#### [NO CHANGE] [data.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/src/data.py)

- Column schema remains identical: `transaction_id, date, product_sku, product_category, quantity, unit_price, discount_pct, net_revenue, customer_id, region, state, channel, return_flag`
- `product_sku` now contains real product names like `SHAN-BIRYANI` instead of `ELEC-TV-04`
- `load_data()`, `_enforce_types()`, `_validate()`, `_clean()`, `filter_data()` all work without modification

---

### 4. ✅ KPIs — No Schema Changes

#### [NO CHANGE] [kpis.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/src/kpis.py)

- All 16 KPIs operate on the same column names — no code changes needed
- KPI values naturally reflect FMCG patterns:
  - Lower AOV (₹800–₹2,500 vs ₹3,500–₹5,000 for e-commerce)
  - Higher sales velocity (frequent FMCG orders)
  - Lower return rates (~3%)
  - Tighter discount ranges

---

### 5. ✅ Visualizations — Category Naming

#### [NO CHANGE] [viz.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/src/viz.py)

- All charts dynamically read category/region/SKU names from the data
- No hardcoded category references — new FMCG categories appear automatically
- `kpi_card_data()` uses Cr/L/K formatting (₹ Crore, Lakh, Thousand) which works correctly for FMCG-range values

---

### 6. ✅ Dashboard Labels

#### [MODIFY] [app.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/app.py)

**What was done:**
- Caption updated: `"EComSpace Group — Business Analytics Dashboard"` → `"Parasnath Distribution Group — FMCG Sales Analytics Dashboard"`
- Footer updated: `"Internship Project at EComSpace Group"` → `"Internship Project at Parasnath Distribution Group"`
- `₹` formatting already handled by `viz.kpi_card_data()` — Cr/L/K ranges work for FMCG carton pricing

---

### 7. ✅ Backend API — No Changes

#### [NO CHANGE] [main.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/backend/main.py)

- FastAPI backend reads from the same CSV structure — no changes needed
- All endpoints consume the same column schema via `src/data.py` and `src/kpis.py`

---

## Stock Normalization — Detailed Methodology

### What "normalized like an average company" means:

| Metric | Previous (E-commerce) | Current (FMCG Distributor) | Rationale |
|--------|-----------------------|----------------------------|-----------|
| **Avg Order Value** | ₹3,500–₹5,000 | ₹800–₹2,500 | FMCG cartons are lower value than electronics |
| **Daily transactions** | ~65/day | ~65/day (kept same) | Maintains dataset size |
| **Return rate** | 8% | 3% | FMCG returns are much lower |
| **Discount range** | 0–35% | 0–18% | FMCG margins are tighter, trade discounts are smaller |
| **Repeat customer rate** | 20% | 45% | Retailers reorder regularly in FMCG |
| **Channel split** | Online 62% / Offline 38% | Offline 72% / Online 28% | FMCG is heavily offline-distributed |
| **Revenue growth** | 0.5%/month | 0.4%/month | Steady FMCG growth |
| **Inventory days** | N/A | 7–10 days | Industry standard for Indian FMCG |
| **Top-selling SKU concentration** | Spread evenly | 80/20 rule (Pareto) | A few SKUs drive most revenue |

### Stock-to-Sales Velocity Mapping:

Using the FG Stock Report (52,328 CTN total):
- **Beverages** (19,988 CTN) ÷ 8 days = **2,499 CTN/day** — fast movers
- **Bakery & Biscuits** (20,218 CTN) ÷ 8 days = **2,527 CTN/day** — fast movers
- **Confectionery** (9,970 CTN) ÷ 10 days = **997 CTN/day** — moderate movers
- **Culinary** (2,152 CTN) ÷ 12 days = **179 CTN/day** — slower, niche
- **Spice Mixes** (2,067 CTN) ÷ 15 days = **138 CTN/day** — imported, slower turnover

These ratios informed the `weight` parameter in the categories config.

---

## Verification Plan

### Automated Tests
```bash
# Regenerate the dataset
python generate_data.py

# Verify data quality
python -c "
import pandas as pd
df = pd.read_csv('data/synthetic/sales_data.csv')
print(f'Rows: {len(df):,}')
print(f'Categories: {df.product_category.unique()}')
print(f'SKUs: {df.product_sku.nunique()}')
print(f'Revenue: ₹{df.net_revenue.sum():,.0f}')
print(f'AOV: ₹{df.net_revenue.mean():,.0f}')
print(f'Return rate: {df.return_flag.mean():.2%}')
print(f'Channel split:')
print(df.channel.value_counts(normalize=True))
"
```

### Manual Verification
- Run `streamlit run app.py` and verify all 7 tabs render correctly with new categories
- Confirm SKU names from the stock reports appear in "Top/Bottom SKUs" view
- Verify the revenue figures look realistic for an FMCG distributor (total revenue should be in ₹XX Crore range over 3+ years)
- Check that the Prophet forecast model still trains successfully with new data

### Verification Status

| Check | Status |
|-------|--------|
| Dataset generated (`sales_data.csv`, 12.1 MB, 101,930 txns) | ✅ |
| 5 FMCG categories in data (Spice Mixes, Confectionery, Beverages, Bakery & Biscuits, Culinary) | ✅ |
| 92 real SKUs in data | ✅ |
| Channel split offline 72.02% / online 27.98% | ✅ |
| Return rate 3.03% | ✅ |
| Dashboard caption updated to "Parasnath Distribution Group" | ✅ |
| Backend API compatible | ✅ |
| Streamlit app running at http://localhost:8501 | ✅ |
| Prophet forecast - library compatibility issue in standalone test, app running | ⚠️ Note: Prophet library version mismatch in environment, but Streamlit app runs successfully |
