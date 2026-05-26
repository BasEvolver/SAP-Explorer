"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Play, CheckCircle, Loader2 } from "lucide-react";
import clsx from "clsx";

interface BapiTerminalProps {
  arTerms: string;
  apExtension: number;
  executionState: "idle" | "executing" | "success";
  onExecute: () => void;
}

export default function BapiTerminal({
  arTerms,
  apExtension,
  executionState,
  onExecute,
}: BapiTerminalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Terminal logging routine when execution starts
  useEffect(() => {
    if (executionState === "executing") {
      setLogs([]);
      const terminalScript = [
        "⏳ [INIT] Establishing cryptographic handshake with S/4HANA ERP instance...",
        "🔑 [AUTH] Multi-sig credential verification completed successfully. Principal: 0x7a8F...90Bc (CFO Gate)",
        "📡 [CONN] RFC Gateway Connection established. Target: SAP_CAL_ECD_300",
        `🚀 [BAPI_1] Dispatching Accounts Receivable Terms change (BAPI_CUSTOMER_EXTENS_CHG)...`,
        `   ↳ Payload: {\n       "BAPI_CUSTOMER_EXTENS_CHG": {\n         "CUSTOMERADDRESS": { "CUSTOMER": "0000401290" },\n         "COMPANYDATA": { "COMPANY_CODE": "1000", "PAY_TERMS": "${arTerms === "Standard" ? "Z030" : "Z010"}" }\n       }\n     }`,
        "📦 [BAPI_1_RESP] Waiting for ERP RPC acknowledge...",
        "✅ [BAPI_1_RESP] SUCCESS! Return Code: S (Success), Msg ID: CZ, No: 042. Message: 'Customer 0000401290 successfully updated.'",
        `🚀 [BAPI_2] Dispatching Accounts Payable Document modification (BAPI_ACC_DOCUMENT_CHANGE)...`,
        `   ↳ Payload: {\n       "BAPI_ACC_DOCUMENT_CHANGE": {\n         "DOCUMENTHEADER": { "OBJ_TYPE": "BKPFF", "COMPANY_CODE": "1000", "DOC_NO": "1900004121", "FISCAL_YEAR": "2026" },\n         "CRITERIA": { "ITEM_NO": "001", "FIELD_NAME": "ZFBDT", "FIELD_VALUE": "${apExtension > 0 ? "20260615" : "20260531"}" }\n       }\n     }`,
        "📦 [BAPI_2_RESP] Waiting for ERP RPC acknowledge...",
        "✅ [BAPI_2_RESP] SUCCESS! Return Code: S (Success), Msg ID: RW, No: 609. Message: 'Document 1900004121 item 001 successfully modified.'",
        "⚙️ [DB_SYNC] Re-querying SAP tables (BSID, BSIK) to guarantee state consistency...",
        "🔍 [DB_SYNC] BSID: Customer 0000401290 now reflects Z010 early payment baseline. Match: OK.",
        `🔍 [DB_SYNC] BSIK: Invoice 1900004121 now reflects ZFBDT date ${apExtension > 0 ? "2026-06-15" : "2026-05-31"}. Match: OK.`,
        "📝 [AUDIT] Generating cryptographic proof of execution packet...",
        "🔒 [AUDIT] Hash created: sha256:8f2a71d8a2...3e8b41 (Wired Audit Lineage Safe)",
        "🎉 [SUCCESS] Closed-loop cycle complete. Working Capital optimized.",
      ];

      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < terminalScript.length) {
          setLogs((prev) => [...prev, terminalScript[currentIndex]]);
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 550); // Speed of logs printing

      return () => clearInterval(interval);
    }
  }, [executionState, arTerms, apExtension]);

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 shadow-lg h-full">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-300">
            Closed-Loop BAPI Execution Console
          </h3>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          <span className="text-[10px] text-slate-500 font-mono">STDOUT</span>
        </div>
      </div>

      {/* Console Display */}
      <div className="flex-1 bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[10.5px] leading-relaxed text-slate-300 overflow-y-auto min-h-[260px] max-h-[360px] shadow-inner select-text">
        {logs.length === 0 && executionState === "idle" && (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
            <Terminal className="w-8 h-8 opacity-30" />
            <p>System ready. Awaiting multi-signature authorization sign-off...</p>
          </div>
        )}

        {logs.map((log, idx) => (
          <div
            key={idx}
            className={clsx(
              "whitespace-pre-wrap transition-opacity duration-300",
              log.startsWith("⏳") || log.startsWith("📡") || log.startsWith("⚙️") || log.startsWith("📝") ? "text-slate-400" : "",
              log.startsWith("🔑") || log.startsWith("🔒") ? "text-purple-400" : "",
              log.startsWith("🚀") ? "text-cyan-400 font-bold" : "",
              log.startsWith("✅") ? "text-emerald-400 font-semibold" : "",
              log.startsWith("🎉") ? "text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded mt-2 inline-block" : "",
              log.startsWith("   ↳") ? "text-slate-500" : ""
            )}
          >
            {log}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal action bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-[10px] text-slate-500">
          RFC Endpoints: Z_TABLE_READER_SRV, BAPI_ACC_DOCUMENT_CHANGE, BAPI_CUSTOMER_EXTENS_CHG
        </div>
        {executionState === "executing" ? (
          <button
            disabled
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed border border-white/5"
          >
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            <span>Executing...</span>
          </button>
        ) : executionState === "success" ? (
          <div className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Executed Successfully</span>
          </div>
        ) : (
          <button
            onClick={onExecute}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-evolver-viridian hover:bg-evolver-viridian-light text-white text-xs font-bold transition-all shadow-lg active:scale-95 group"
          >
            <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
            <span>Execute SAP Write-Back</span>
          </button>
        )}
      </div>
    </div>
  );
}
