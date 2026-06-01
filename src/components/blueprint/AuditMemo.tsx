"use client";

import { FileText, Copy, Printer, CheckCircle } from "lucide-react";
import { useState } from "react";

interface AuditMemoProps {
  arTerms: string;
  apExtension: number;
  minBuffer: number;
  discountRate: number;
  lowestUnoptValue: number;
  signatureDate: string;
  txHash: string;
}

export default function AuditMemo({
  arTerms,
  apExtension,
  minBuffer,
  discountRate,
  lowestUnoptValue,
  signatureDate,
  txHash,
}: AuditMemoProps) {
  const [copied, setCopied] = useState(false);

  const memoContent = `================================================================================
                       ARIA PLATFORM AUDIT MEMORANDUM
================================================================================
SYSTEM REFERENCE : ARIA-WC-OPTIMIZER-2026-F1
DATE OF ANALYSIS : May 25, 2026
CFO APPROVAL GATE: VERIFIED (Signature: 0x7a8F...90Bc)
STATUS           : COMMITTED & COMPLETED IN S/4HANA ERP
--------------------------------------------------------------------------------

1. EXECUTIVE SUMMARY & OBJECTIVE FUNCTION
-----------------------------------------
This document serves as an audit-ready working paper detailing the automated
and reviewer-approved working capital optimization cycle executed by the 
Aria Engine on May 25, 2026. 

The objective function of this run was to resolve an impending liquidity breach
on June 12, 2026, where the unoptimized cash balance was projected to dip to
$${lowestUnoptValue.toLocaleString()} (deficit of $${(minBuffer - lowestUnoptValue).toLocaleString()} relative to
the minimum corporate safety buffer of $${minBuffer.toLocaleString()}).

2. DATA LINEAGE & ERP EXTRACTS
------------------------------
Relational lineage was preserved across the following core S/4HANA tables:
- BSID (Accounts Receivable Open Items):
  * Customer 0000401290 (Amplify)
  * Invoice No: 900200845 | Gross Amount: $450,000
  * Original Payment Terms: Z030 (Net 30) | Historical Settl. Lag: 48 days
- BSIK (Accounts Payable Open Items):
  * Vendor 100082 (ASML)
  * Invoice No: 1900004121 | Item: 001 | Gross Amount: $320,000
  * Original Due Date: May 31, 2026
- T052 (Payment Terms Master):
  * Terms Code Z010 loaded (2% discount if settled in 10 days, Net 30)

3. CORPORATE POLICY VERIFICATION (POLICY-AS-CODE)
--------------------------------------------------
- Policy TR-09 (Minimum Cash Buffer): PASSED
  * Condition: Min simulated cash >= $${minBuffer.toLocaleString()}
  * Status: MET (Optimized Cash Runway stabilizes above the limit)
- Policy AR-02 (Revenue Leakage Cap): PASSED
  * Condition: Max discount <= 2% unless emergency exception exists.
  * Status: MET (Discount set at ${discountRate.toFixed(1)}% | Emergency Active)
- Policy AP-01 (Supply Chain Integrity): PASSED
  * Condition: Max payment extension <= 15 days without override.
  * Status: MET (DPO extended by ${apExtension} days)

4. CLOSED-LOOP ERP WRITE-BACK DETAILS
-------------------------------------
Upon CFO multi-signature validation, the following BAPIs were executed:

- BAPI_CUSTOMER_EXTENS_CHG
  * Target Customer: 0000401290 (Amplify)
  * Modification: Update ZTERM from Z030 (Net 30) to Z010 (2% 10 / Net 30)
  * Status: SUCCESS (Return code: S)
  * Result: Receivable of $441,000 pulled in on Day 10.

- BAPI_ACC_DOCUMENT_CHANGE
  * Target Document: 1900004121 (ASML) | Item: 001
  * Modification: Update ZFBDT baseline date to June 15, 2026 (+${apExtension}d)
  * Status: SUCCESS (Return code: S)
  * Result: Outbound payment of $320,000 extended, maintaining runway.

5. VERIFICATION & LINEAGE AUDIT HASH
------------------------------------
Post-execution re-queries confirmed S/4HANA tables BSID and BSIK are synced
with matching parameters.

CRYPTOGRAPHIC PROOF PACKET HASH:
sha256:${txHash}

--------------------------------------------------------------------------------
                     Strictly Private & Confidential - Internal Use Only
================================================================================`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(memoContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-evolver-viridian" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300">
            Generated Treasury Audit Memo & Working Paper
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/5 transition-colors flex items-center space-x-1.5 text-[10px] font-medium"
          >
            {copied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/5 transition-colors flex items-center space-x-1.5 text-[10px] font-medium"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Workpaper</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-100/90 dark:bg-black/60 rounded-xl border border-slate-200 dark:border-white/5 p-5 overflow-x-auto shadow-inner select-text">
        <pre className="font-mono text-[10px] leading-relaxed text-slate-800 dark:text-slate-300 whitespace-pre">
          {memoContent}
        </pre>
      </div>
    </div>
  );
}
