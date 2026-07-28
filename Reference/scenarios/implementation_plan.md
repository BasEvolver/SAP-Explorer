# Implementation Plan - Master Demo Design & Scenarios (Aether Precision Systems)

We will establish a unified narrative for the ARIA Manifold application by focusing on a single fictitious enterprise: **Aether Precision Systems** (Advanced Aerospace & Defense Instruments). This document outlines the plan to build a Master Demo Design and document three distinct "Day in the Life" strategic executive scenarios before implementing them in the UI.

---

## Proposed Artifacts

We will create the following markdown documents under the artifacts directory:

### 1. [master_demo_design.md](file:///C:/Users/baska/.gemini/antigravity-ide/brain/f2d761b1-e783-4962-87bd-1c27946f015a/master_demo_design.md) [NEW]
The blueprint defining:
- The fictitious enterprise profile of Aether Precision Systems (vertical, corporate structure, systems landscape).
- The integration mappings connecting the **ARIA Cognitive Connectome** (Category Theory, Differential Geometry, Lorenz Flows, Negentropy) directly to **SAP transparent tables** (`ACDOCA`, `BSEG`, `BKPF`, `MARD`, `EKPO`).
- The unified Executive Cockpit UI design rules (Framer Motion entry, 20px card border radius, dynamic bottom floating composer, color schemes).

### 2. [scenario_1_tprm_compliance.md](file:///C:/Users/baska/.gemini/antigravity-ide/brain/f2d761b1-e783-4962-87bd-1c27946f015a/scenario_1_tprm_compliance.md) [NEW]
- **Scenario**: TPRM Alert & Invoice Hold (The SwissOptics AG Case).
- **Situation**: SwissOptics AG (key optical supplier) flags a security warning. Aether must audit open invoices, flag duplicates, and freeze disbursements.
- **Reasoning**: Connectome mapping from vendor (`LFA1`) to ledger (`BSEG`) to flag risk curvature.
- **Actions**: Trigger SAP G/L Payment Block `ZLSPR` via BAPI.
- **Outcome**: Aether prevents fraud and resolves a duplicate billing mismatch.
- **Clicks/Screens**: Steps to showcase inside the UI.

### 3. [scenario_2_supply_chain_hedging.md](file:///C:/Users/baska/.gemini/antigravity-ide/brain/f2d761b1-e783-4962-87bd-1c27946f015a/scenario_2_supply_chain_hedging.md) [NEW]
- **Scenario**: Strait of Hormuz Supply Chain Disruption & FX Hedging.
- **Situation**: Geopolitical disruption cuts raw material supply from Singapore. Aether must reallocate procurement to US supplier and hedge the resulting $1.5M USD exposure.
- **Reasoning**: Geodesic mapping in storage (`MARD`) triggering alternate procurement morphs.
- **Actions**: Trigger ME51N Purchase Requisition and post FX hedging contracts.
- **Outcome**: Zero production downtime, locked-in exchange rate saving Aether $45,000.
- **Clicks/Screens**: Steps to showcase inside the UI.

### 4. [scenario_3_working_capital_sweep.md](file:///C:/Users/baska/.gemini/antigravity-ide/brain/f2d761b1-e783-4962-87bd-1c27946f015a/scenario_3_working_capital_sweep.md) [NEW]
- **Scenario**: Global Treasury Cash Sweep & Tax Compliance.
- **Situation**: US subsidiary borrowing costs are high, while Singapore holds idle cash. Aether must sweep funds while auditing tax codes to prevent pricing penalties.
- **Reasoning**: Coupled flow spread minimization ($\Delta = 4.7\%$) under intercompany tax constraints.
- **Actions**: Trigger F110 Automatic Payment Program proposal.
- **Outcome**: Net interest saving of $235,000/yr with full audit compliance.
- **Clicks/Screens**: Steps to showcase inside the UI.

---

## Open Questions

> [!NOTE]
> We will proceed with generating these design files immediately. Once the design files are approved, we will update the ARIA Manifold cockpit (`page.tsx`) to implement the scenario dropdown, interactive timeline tabs, and BAPI/RFC visual tables corresponding to these three scenarios.
