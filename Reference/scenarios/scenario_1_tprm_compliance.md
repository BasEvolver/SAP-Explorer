# Scenario 1: SwissOptics TPRM Risk & Invoice Block

This scenario demonstrates ARIA’s ability to combine risk profiling (TPRM) with transaction auditing (Invoice Verification) to automatically contain financial risk inside the SAP ledger.

---

## 1. The Scenario Profile

*   **Scenario Node**: SwissOptics AG (Vendor Code: `VEND_CH_9002`)
*   **Strategic Axis**: Third-Party Risk Management (TPRM) & Invoice Compliance Audit

### Situation
Aether Precision Systems relies on **SwissOptics AG** to supply optical lenses for satellite sensors. ARIA's automated threat crawler flags a critical cybersecurity breach and operational distress warning at SwissOptics AG (their D&B risk score drops from 92 to 45). SwissOptics has $450,000 in open invoices pending payment. If Aether disburses cash to unverified accounts during a breach, they face Business Email Compromise (BEC) fraud.

### Reasoning (Manifold Pillars)
*   **The Connectome Traversal**: ARIA maps the risk from the vendor master (`LFA1`) to active purchase orders (`EKPO`) and accounts payable ledgers (`BSEG`).
*   **The Metric Curvature**: The risk level concentrates in the active payment transaction path. Unverified bank details on SwissOptics' pending invoices constitute an elevated threat vector (high curvature: $\kappa = 8.2$). The shortest lawful path (geodesic) is to suspend payment execution.

---

## 2. Core Execution Mappings

### SAP Explorer Mappings (Data Explored)
1.  **Vendor Master (`LFA1`)**:
    *   `LIFNR`: `VEND_CH_9002` (SwissOptics)
    *   `BANKN`: `CH89 0000 1209 8890 1` (Remittance Bank Account)
    *   `DOME1` (D&B Score): `45` (Critical Alert)
2.  **Accounting Document Segment (`BSEG`)**:
    *   `BELNR`: `10002841` (Pending Invoice)
    *   `DMBTR`: `450,000.00`
    *   `ZLSPR` (Payment Block): ` ` (Unblocked)

### Corrective Action Payload (BAPI Dispatched)
ARIA generates the adjustment document calling the payment block function:
-   **SAP Function**: `BAPI_ACC_DOCUMENT_POST` (or invoice update)
-   **Execution Payload**:
    ```json
    {
      "InvoiceNumber": "10002841",
      "CompanyCode": "AETHER_DE",
      "VendorCode": "VEND_CH_9002",
      "PaymentBlockCode": "A",
      "Reason": "TPRM Cyber Security Hold",
      "Timestamp": "2026-07-26T10:45:00Z"
    }
    ```

---

## 3. Clicks & UI Walkthrough (Demo Script)

1.  **Screen 1 (Signal)**:
    *   *Action*: The user opens the cockpit and clicks the active red alert card: **"TPRM Anomaly: SwissOptics AG"**.
    *   *Visual*: The cockpit switches to the SwissOptics scenario. The Curvature Index spikes to **8.2 (Critical)**.
2.  **Screen 2 (Explore)**:
    *   *Action*: User clicks **"Next Step"** (or Step 2).
    *   *Visual*: Renders the SAP table mapping for `LFA1` and `BSEG`, highlighting the SwissOptics D&B score of `45` and showing that Invoice `10002841` is currently `Unblocked`.
3.  **Screen 3 (Simulate)**:
    *   *Action*: User clicks **"Next Step"** (or Step 3).
    *   *Visual*: Displays a slider labeled **"Security Audit Rigor"**. Dragging the slider increases containment rating.
4.  **Screen 4 (Act)**:
    *   *Action*: User clicks **"Next Step"** (or Step 4), reviews the generated JSON payload, and clicks **"Dispatch Corrective Action"**.
    *   *Visual*: A success checkmark appears. The live terminal log appends:
        `[BAPI Gateway] Dispatched BAPI update. Invoice 10002841 Payment Block (BSEG-ZLSPR) set to 'A' (Blocked for Payment). Risk Curvature stabilized to 1.0.`
