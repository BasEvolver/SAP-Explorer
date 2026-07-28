# Master Demo Design: Aether Precision Systems

This document serves as the structural blueprint for the **ARIA Manifold Executive Cockpit** demo, aligning the theoretical concepts of the **Manifold Enterprise** paper with the practical technical structures of a global ERP system (SAP S/4HANA).

---

## 1. Fictitious Enterprise Profile: **Aether Precision Systems**

**Aether Precision Systems** is a leading global developer and manufacturer of **Advanced Aerospace & Defense Instruments** (including satellite optical sensors, drone guidance electronics, and high-frequency radar components).

### Global Corporate Structure
*   **Aether Headquarter (Germany - DE-10)**: Core engineering, titanium procurement, and final assembly plants. Holds primary corporate cash pools (EUR).
*   **Aether USA (United States - US-20)**: Main sales office, final delivery operations, and client contracting. Borrows short-term debt in USD for localized scaling.
*   **Aether Asia (Singapore - SG-30)**: High-speed assembly of microelectronics and sensor chips. Re-exports inputs to Germany and holds idle surplus liquidity in USD/SGD.

### Legacy Technical Systems Landscape
Aether's operations are recorded across a traditional SAP S/4HANA system. Transaction data is stored in standard transparent database tables, while adjustments are executed via BAPIs and RFC calls. These siloed tables form the **discrete skeleton** that ARIA's **Cognitive Connectome** traverses.

---

## 2. Integrated Data: SAP Mappings

ARIA interacts directly with Aether's SAP system by mapping manifold trajectories to standard transparent tables:

| SAP Table | Table Technical Name | Monitored Fields | Role in ARIA Manifold |
| :--- | :--- | :--- | :--- |
| **Universal Ledger** | `ACDOCA` | `RBUKRS` (Company), `RACCT` (Account), `RTCUR` (Currency), `WSL` (Amount) | Tracks idle cash allocations and cash pool deficits. |
| **Accounting Document Segment** | `BSEG` | `BELNR` (Doc No), `BUKRS` (Company), `MWSKZ` (Tax Code), `ZLSPR` (Payment Block) | Audits payment blocks, transfer pricing, and VAT exceptions. |
| **Material Storage Data** | `MARD` | `MATNR` (Material), `WERKS` (Plant), `LABST` (Unrestricted Stock count) | Monitors raw component shortages and buffer thresholds. |
| **Vendor Master Gate** | `LFA1` / `LFB1` | `LIFNR` (Vendor), `NAME1` (Name), `BANKN` (Bank Account), `DOME1` (D&B Risk tier) | Manages third-party supplier risk profiles and bank details. |
| **Purchase Order Details** | `EKPO` | `EBELN` (PO Number), `MENGE` (Quantity), `NETPR` (Net Price) | Validates active procurement volumes against invoice line items. |

---

## 3. The ARIA Manifold Pillar Mappings

| Manifold Pillar | Paper Theory | S/4HANA Reality | Cockpit Representation |
| :--- | :--- | :--- | :--- |
| **I. The Atlas** | Category-theoretic lawful mapping of charts and morphisms. | Mappings between different SAP tables (e.g. `LFA1` vendor data composing with `BSEG` invoice segments). | **"Morphism Checks"** showing if intercompany processes compose algebraically. |
| **II. The Metric** | Traversal along geodesics; risk curavture concentration ($\kappa$). | Geodesic path optimization of payment delays. Divergence flags (errors/pricing drift) as curvature spikes. | **"Risk Curvature Index"** and deviation charts. |
| **III. The Flow** | Lorenz Dynamics monitoring volatility of coupled signals. | Real-time monitoring of cash depletion rates (DSO) and procurement lead times (DIO). | **"Liquidity Orbit Graph"** or dynamic SVG curves. |
| **IV. The Arrow** | Negentropy engine counteracting AI sprawl by creating order. | The density of verified records and structured BAPI payloads created per unstructured email/log. | **"Negentropy Meter (bits/token)"** tracking structural order. |

---

## 4. Cockpit Layout Conventions

The UI will replicate the look and feel of the **Evolver Adaptive Platform**:
1.  **Warm-Beige Theme Default**:
    *   Body: Warm Off-white (`#f3eee4`)
    *   Workspace Container: Slate-gray light panel (`#f4f6f8`)
    *   Widget Cards: White background (`#ffffff`), `20px` border radius (`rounded-[20px]`), thin border (`border-slate-900/10`), light shadow.
    *   Dark Slate Buttons (`#0f172a`) with white text.
2.  **Floating bottom composer**:
    *   Input box styled with a signature green border (`border-[#027864]`), floating at `fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4`.
    *   Suggestion pills just above the input styled with custom pastel backgrounds (`rounded-[7px]`) that auto-fill the composer upon clicks.
3.  **Departmental Alert Cards (Executive Attention Tiles)**:
    *   Instead of switching tenants, the switcher at the top will be a **Scenario Selector** displaying active executive attention tiles. Clicking a tile updates the cockpit state:
        *   🔴 **SwissOptics TPRM Anomaly**
        *   🔴 **Strait of Hormuz Supply Chain Disruption**
        *   🟢 **Singapore-US Cash Sweep Opportunity**
