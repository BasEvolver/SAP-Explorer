# Scenario 3: Global Treasury Cash Sweep & Tax Compliance

This scenario demonstrates ARIA’s ability to analyze working capital inefficiencies across global balance ledgers, simulate cash pool optimization, verify tax codes, and execute intercompany sweeps.

---

## 1. The Scenario Profile

*   **Scenario Node**: Aether Singapore to Aether USA Cash Sweep
*   **Strategic Axis**: Working Capital Optimization & Intercompany Tax Compliance

### Situation
Aether USA (US-20) holds short-term debt at an interest rate of 8.2%, costing them significant interest expense. Simultaneously, Aether Asia (Singapore - SG-30) holds a surplus of $8M idle cash yielding only 3.5%. 

ARIA detects this capital inefficiency: a net interest spread loss of **$235,000/year** ($\Delta = 4.7\%$). ARIA proposes sweeping $5M from Singapore to pay down the US debt. However, to execute this lawfully, ARIA must first verify intercompany transfer tax codes in the Universal Journal (`ACDOCA`) to avoid frozen funds or transfer pricing audits.

### Reasoning (Manifold Pillars)
*   **The Metric Geodesic**: The interest spread differential is a continuous leakage on the manifold. The geodesic represents a path that sweeps this capital immediately to minimize financial distance.
*   **The Atlas (Category Theory)**: The transfer of cash from SG-30 to US-20 is a morphism crossing legal charts. It must be mapped via tax functors ensuring VAT/Withholding tax compliance is satisfied at the boundary.

---

## 2. Core Execution Mappings

### SAP Explorer Mappings (Data Explored)
1.  **Universal Ledger (`ACDOCA`)**:
    *   `RBUKRS` (Company Code): `AETHER_SG` (Singapore) / `AETHER_US` (USA)
    *   `RACCT` (Account): `0000113100` (Cash Surplus) / `0000215000` (Short-term Debt)
    *   `WSL` (Amount): `8,000,000.00` / `-5,000,000.00`
2.  **Ledger Items (`BSEG`)**:
    *   `MWSKZ` (Tax Code): `I0 (Intercompany Tax Exempt)` (Verified compliant)

### Corrective Action Payload (BAPI Dispatched)
ARIA generates the Automatic Payment Program proposal to execute the bank clearing:
-   **SAP Function**: `BAPI_PAYMENT_PROPOSAL_CREATE` (T-Code F110 APP)
-   **Execution Payload**:
    ```json
    {
      "RunDate": "2026-07-26",
      "RunID": "SWEEP04",
      "SourceCompanyCode": "AETHER_SG",
      "DestinationCompanyCode": "AETHER_US",
      "PaymentMethod": "T (Wire Transfer)",
      "SweepAmount": 5000000.00,
      "Currency": "USD",
      "IntercompanyGL": "0000129000 (Intercompany Clearing Account)"
    }
    ```

---

## 3. Clicks & UI Walkthrough (Demo Script)

1.  **Screen 1 (Signal)**:
    *   *Action*: User clicks the green card: **"Treasury Sweep Opportunity: SG $\rightarrow$ US"**.
    *   *Visual*: Cockpit updates. Displays interest rate spreads ($\Delta = 4.7\%$) and flags the potential yield gain. Curvature is **7.4 (Opportunity)**.
2.  **Screen 2 (Explore)**:
    *   *Action*: User clicks **"Next Step"**.
    *   *Visual*: Renders the SAP transparent table mapping for `ACDOCA` showing company balances and verified intercompany G/L accounts.
3.  **Screen 3 (Simulate)**:
    *   *Action*: User clicks **"Next Step"**.
    *   *Visual*: Displays a slider: **"Sweep Volume"** ($1M to $8M). Dragging the slider dynamically calculates net annual interest savings (e.g., $5M sweep yields $+235,000/yr$).
4.  **Screen 4 (Act)**:
    *   *Action*: User clicks **"Next Step"**, inspects the F110 Payment Proposal JSON payload, and clicks **"Dispatch Corrective Action"**.
    *   *Visual*: A success checkmark flashes. Log terminal appends:
        `[BAPI Gateway] Payment proposal proposal created via BAPI_PAYMENT_PROPOSAL_CREATE (Run ID: SWEEP04) for $5M USD. Clearing posted to AETHER_US. Curvature stabilized.`
