# FMCG Distribution Dataset Replacement — Implementation Plan

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

## Open Questions

> [!IMPORTANT]
> **Company name**: The dashboard currently says "EComSpace Group." Should I keep this or change it to something like "Parasnath Distribution" based on the warehouse name in the images?

> [!IMPORTANT]  
> **Regions**: The images don't indicate geographic distribution. Should I:
> - Keep the existing 6 Indian regions with similar weights?
> - Focus on fewer regions (West + North + South) since this seems like a niche importer?
> - Use specific cities/states if you have preferences?

> [!IMPORTANT]
> **Channel split**: The current data has online (62%) / offline (38%). For an FMCG distributor, it's typically the opposite — should I flip to **offline (75%) / online (25%)**?

---

## Proposed Changes

### 1. Configuration — Categories & Business Context

#### [MODIFY] [config.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/config.py)

**Replace the 8 e-commerce categories with 5 FMCG categories:**

```python
CATEGORIES = {
    "Beverages":        {"min_price": 120, "max_price": 1500, "weight": 0.28, "brand": "Pran"},
    "Bakery & Biscuits": {"min_price": 100, "max_price": 2000, "weight": 0.27, "brand": "Pran/Malkist"},
    "Confectionery":    {"min_price": 80,  "max_price": 3000, "weight": 0.22, "brand": "Choki Choki/Kopiko"},
    "Culinary":         {"min_price": 300, "max_price": 1500, "weight": 0.13, "brand": "Pran"},
    "Spice Mixes":      {"min_price": 1400,"max_price": 3200, "weight": 0.10, "brand": "Shan"},
}
```

**Update channel split** to match FMCG distribution:
```python
CHANNELS = {"offline": 0.72, "online": 0.28}
```

**Adjust return rate** (FMCG has lower returns than e-commerce):
```python
RETURN_RATE = 0.03  # ~3% for FMCG (vs 8% e-commerce)
```

**Add carton-level stock metadata** to `config.py` for reference/stock level features.

---

### 2. Data Generator — Real Product SKUs

#### [MODIFY] [generate_data.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/generate_data.py)

**Replace generic SKU templates** with real product names from the images:

```python
sku_templates = {
    "Beverages": [
        "LITCHI-DRINK-150ML", "LITCHI-DRINK-250ML", "DRINKO-250ML-LITCHI",
        "DRINKO-250ML-MANGO", "FROOTO-MANGO-250ML", "PRAN-FAZLEE-MANGO-500ML",
        "FROOTO-MANGO-500ML", "PRAN-MANGO-FRUIT-500ML", "ICE-POP-ASSORTED-50ML",
        "DOUBLE-DOZER-CAN-250ML", "PRAN-MANGO-BASIL-250ML",
        "DRINKO-330ML-MANGO", "DRINKO-330ML-PINEAPPLE", "DRINKO-330ML-STRAWBERRY",
    ],
    "Bakery & Biscuits": [
        "POTATA-BISCUIT-75GM", "POTATA-CREAM-ONION-75GM", "POTATA-BBQ-75GM",
        "POTATA-CHEESE-75GM", "POTATA-BISCUIT-25GM-96PCS", "POTATA-BISCUIT-12.5GM",
        "FAMILY-TOAST-200GM", "GARLIC-TOAST-200GM", "MALKIST-CHEESE-45RS",
        "MALKIST-CHOCOLATE-45RS", "MALKIST-CHEESE-25MRP", "MALKIST-CHOCOLATE-25MRP",
        "MALKIST-CAPPUCCINO-45RS", "MALKIST-AMERICAN-STYLE",
        "FIT-CRACKERS-120GM", "PRAN-DRY-CAKE-100GM", "POTATA-SPICY-100GM",
    ],
    "Confectionery": [
        "CHOKI-CHOKI-XL", "CHOKI-CHOKI-XL-6PCS", "CHOKI-CHOKI-STANDARD",
        "CHOKI-ROLLZ-JAR", "CHOKI-STIX", "CHOKI-STIX-6PCS",
        "KOPIKO-100PCS", "KOPIKO-BUCKET", "KOPIKO-JAR-12PCS", "KOPIKO-PKT-47MRP",
        "CHOCO-BEAN-PET-JAR-DOGGY", "CHOCO-BEAN-PET-JAR-FEDER",
        "CHOCOBEAN-TOFFEE-20GM", "CHOCOBEAN-TUBE-35GM",
        "MAGIC-CUP-100PCS", "LOLLIPOP-8GM-ASSORTED", "MILK-KULFI-4GM",
        "MR-TOM-CANDY-4GM", "MILK-KANDEEZ-3.5GM",
        "PUDDING-35GM-ASSORTED", "PUDDING-35GM-MANGO",
        "JAM-O-JAM-STRAWBERRY", "JAM-O-JAM-BLUEBERRY", "JAM-O-JAM-SMALL",
        "PLUS-PLUS-MANGO-MASALA", "PRAN-MILK-WAFER-ROLL",
        "PRAN-CHOCO-WAFER-ROLL", "WONDER-KID-20GM", "GREEN-MANGO-CANDY-4GM",
    ],
    "Culinary": [
        "MR-NOODLES-60GM-KOREAN-SPICY", "CUP-NOODLES-40GM-CHICKEN",
        "MR-NOODLES-50GM-CHICKEN-MASALA", "CUP-NOODLES-40GM-CURRY",
    ],
    "Spice Mixes": [
        "SHAN-BIRYANI", "SHAN-SPECIAL-BOMBAY-BIRYANI", "SHAN-PUNJABI-YAKHNI",
        "SHAN-SHAMI-KABAB", "SHAN-SEEKH-KABAB", "SHAN-CHICKEN-TIKKA",
        "SHAN-TANDOORI-MASALA", "SHAN-TIKKA-BOTI", "SHAN-NIHARI",
        "SHAN-ACHAR-GOSHT", "SHAN-CHICKEN-MASALA", "SHAN-KORMA",
        "SHAN-FRIED-FISH", "SHAN-KARAHI-GOSHT", "SHAN-MALAY-BIRYANI",
        "SHAN-SINDHI-BIRYANI", "SHAN-BUTTER-CHICKEN", "SHAN-HALEEM-MASALA",
        "SHAN-CHANA-MASALA", "SHAN-MEAT-MASALA", "SHAN-PAYA-MASALA",
        "SHAN-CHAAT-MASALA", "SHAN-GARAM-MASALA", "SHAN-PULAU-BIRYANI",
    ],
}
```

**Key changes in generator logic:**
- Use product names directly (not `{category_prefix}-{sku}-{variant}` format)
- Price per carton (not per unit) — this is B2B distribution
- Quantity represents number of cartons per order (typically 1–50)
- Maintain festive season spikes (relevant for FMCG too — Diwali, Eid, Ramadan for Shan products)

---

### 3. Data Pipeline — Minor Adjustments

#### [MODIFY] [data.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/src/data.py)

- No structural changes needed — the column schema (transaction_id, date, product_sku, product_category, quantity, unit_price, discount_pct, net_revenue, customer_id, region, state, channel, return_flag) remains the same
- `product_sku` will now contain real product names like `SHAN-BIRYANI` instead of `ELEC-TV-04`

---

### 4. KPIs — No Schema Changes

#### [MODIFY] [kpis.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/src/kpis.py)

- No changes needed — all KPIs operate on the same column names
- The values will naturally reflect FMCG patterns (lower AOV, higher velocity, lower return rates)

---

### 5. Visualizations — Category Naming

#### [MODIFY] [viz.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/src/viz.py)

- No code changes needed — categories are dynamic from data
- The charts will automatically show the new category names

---

### 6. Dashboard Labels

#### [MODIFY] [app.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/app.py)

- Update the caption from "EComSpace Group" → appropriate company name
- Adjust the `₹` formatting in `kpi_card_data` — values will be smaller (FMCG carton pricing vs electronics)

---

### 7. Backend API — No Changes

#### [NO CHANGE] [main.py](file:///Users/ahmedmoosani/Desktop/Projects/Internship/sales-dashboard/backend/main.py)

- The FastAPI backend reads from the same CSV structure — no changes needed

---

## Stock Normalization — Detailed Methodology

### What "normalized like an average company" means:

| Metric | Current (E-commerce) | Target (FMCG Distributor) | Rationale |
|--------|---------------------|--------------------------|-----------|
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

These ratios will inform the `weight` parameter in the categories config.

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
