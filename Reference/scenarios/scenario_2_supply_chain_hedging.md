# Scenario 2: Strait of Hormuz SC Disruption & FX Hedging

This scenario demonstrates ARIA’s ability to detect physical supply chain bottlenecks in SAP material records, reallocate supply lines, and manage the resulting treasury FX currency exposures automatically.

---

## 1. The Scenario Profile

*   **Scenario Node**: Strait of Hormuz Shipping Lanes (Material: Cobalt Sensors)
*   **Strategic Axis**: Supply Chain Disruption Reallocation & Treasury FX Hedging

### Situation
Aether Headquarter (Germany) imports custom cobalt sensor boards from Aether Asia (Singapore). Geopolitical conflict shuts down shipping lanes in the **Strait of Hormuz**, halting all cargo transits. 

ARIA flags that Aether Germany's unrestricted stock levels in transparent table `MARD` will drop to zero in 12 days, triggering a full assembly plant shutdown. ARIA must instantly search the connectome for an alternative approved supplier, allocate a new order to **AlloyTech US**, and hedge the resulting $1.5M USD transaction exposure to mitigate EUR/USD currency volatility.

### Reasoning (Manifold Pillars)
*   **The Flow (Lorenz Dynamics)**: Physical inventory levels and cash commitments are coupled flows. A halt in inventory flow halts assembly, disrupting subsequent sales revenue.
*   **The Metric Geodesic**: To prevent plant shutdown, ARIA recalculates the geodesic path, choosing a path with higher procurement costs but zero delivery delays (AlloyTech US).
*   **The Atlas (Category Theory)**: Intercompany material allocation maps from a shipping chart to a treasury FX chart. Mappings compose to post a currency hedging morphism along with the purchase requisition.

---

## 2. Core Execution Mappings

### SAP Explorer Mappings (Data Explored)
1.  **Storage Bin Data (`MARD`)**:
    *   `MATNR`: `MAT_COB_4019` (Cobalt Sensor)
    *   `WERKS`: `PLANT_DE_10` (German Assembly)
    *   `LABST` (Stock Count): `1,200.00` (Reorder point: 5,000)
2.  **Purchase Order Headers (`EKKO`)**:
    *   `LIFNR` (Vendor): `VEND_SG_3002` (Singapore Cargo Blocked)

### Corrective Action Payload (BAPI Dispatched)
ARIA generates a dual payload to submit the emergency purchase requisition and lock the currency hedge:
-   **SAP Functions**: `BAPI_PR_CREATE` (Purchase Requisition) & FX hedge post.
-   **Execution Payload**:
    ```json
    {
      "Requisition": {
        "Material": "MAT_COB_4019",
        "Plant": "PLANT_DE_10",
        "Quantity": 5000,
        "SourceVendor": "VEND_US_8009 (AlloyTech US)",
        "DocType": "NB (Standard PR)"
      },
      "TreasuryHedge": {
        "Instrument": "Forward FX Contract",
        "BaseCurrency": "EUR",
        "QuoteCurrency": "USD",
        "NotionalAmount": 1500000.00,
        "StrikeRate": 1.085,
        "MaturityDate": "2026-08-30"
      }
    }
    ```

---

## 3. Clicks & UI Walkthrough (Demo Script)

1.  **Screen 1 (Signal)**:
    *   *Action*: User clicks the red card: **"Supply Chain Disruption: Strait of Hormuz"**.
    *   *Visual*: The cockpit shifts. The stock depletion curve shows a bottleneck in 12 days. Curvature spikes to **6.9**.
2.  **Screen 2 (Explore)**:
    *   *Action*: User clicks **"Next Step"**.
    *   *Visual*: Renders the SAP transparent table mapping for `MARD` (showing only `1,200` units in stock) and active supplier records showing the block.
3.  **Screen 3 (Simulate)**:
    *   *Action*: User clicks **"Next Step"**.
    *   *Visual*: Displays a slider: **"FX Hedge Ratio"** (0% to 100%). Dragging the slider dynamically updates the projected cost variance of the USD purchase, showing currency risk minimization.
4.  **Screen 4 (Act)**:
    *   *Action*: User clicks **"Next Step"**, inspects the dual BAPI JSON payload, and clicks **"Dispatch Corrective Action"**.
    *   *Visual*: A success checkmark flashes. Log terminal appends:
        `[BAPI Gateway] Emergency PR generated via BAPI_PR_CREATE for 5,000 units of MAT_COB_4019. Forward FX Contract posted for $1.5M USD. Curvature stabilized.`
