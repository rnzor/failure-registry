import React, { useState } from 'react';

type NodeType = 'question' | 'solution' | 'failure';

interface Node {
  id: string;
  type: NodeType;
  text: string;
  details?: string;
  options?: { label: string; nextId: string }[];
}

const WIZARD_DATA: Record<string, Node> = {
  'start': {
    id: 'start',
    type: 'question',
    text: "Select Primary Failure Symptom",
    options: [
      { label: "High Error Rate (>5% 5xx)", nextId: "check-errors" },
      { label: "High Latency / API Timeout", nextId: "check-latency" },
      { label: "Incorrect Output / Hallucination", nextId: "check-ai" },
      { label: "Cost Explosion / Token Usage", nextId: "check-cost" }
    ]
  },
  'check-errors': {
    id: 'check-errors',
    type: 'question',
    text: "Current Error Scope?",
    options: [
      { label: "100% (Hard Outage)", nextId: "check-deploy" },
      { label: "Intermittent / Cascading", nextId: "check-backpressure" }
    ]
  },
  'check-deploy': {
    id: 'check-deploy',
    type: 'question',
    text: "Recent Deployment Detected?",
    options: [
      { label: "Yes (< 60m ago)", nextId: "sol-rollback" },
      { label: "No (Steady State)", nextId: "check-infra" }
    ]
  },
  'check-backpressure': {
    id: 'check-backpressure',
    type: 'question',
    text: "Downstream Saturation?",
    options: [
      { label: "Yes (DB/3rd Party Pegged)", nextId: "sol-circuit-breaker" },
      { label: "No (Internal Queueing)", nextId: "sol-scaling" }
    ]
  },
  'check-ai': {
    id: 'check-ai',
    type: 'question',
    text: "Input Handling Status?",
    options: [
      { label: "Adversarial Input Suspected", nextId: "sol-injection" },
      { label: "Standard Input failing", nextId: "sol-drift" }
    ]
  },
  'check-cost': {
    id: 'check-cost',
    type: 'question',
    text: "Agent Behavior Mode?",
    options: [
      { label: "Recursive Loops Detected", nextId: "sol-kill-switch" },
      { label: "Inefficient RAG fetching", nextId: "sol-rag-opt" }
    ]
  },
  'check-latency': {
    id: 'check-latency',
    type: 'question',
    text: "Network Path Status?",
    options: [
      { label: "Cross-region latency spike", nextId: "sol-region" },
      { label: "Localized to single PoP", nextId: "sol-cdn" }
    ]
  },
  'check-infra': {
    id: 'check-infra',
    type: 'question',
    text: "Infrastructure Vital Signs?",
    options: [
      { label: "Certificate Expiration", nextId: "sol-cert" },
      { label: "DNS / NXDOMAIN", nextId: "sol-dns" },
      { label: "All Green (Unknown)", nextId: "fail-escalate" }
    ]
  },

  // Solutions
  'sol-rollback': { id: 'sol-rollback', type: 'solution', text: "Emergency Rollback Required", details: "Deployment correlation is >90%. Execute LKG (Last Known Good) artifact deployment immediately. Do not attempt in-place hotfix." },
  'sol-circuit-breaker': { id: 'sol-circuit-breaker', type: 'solution', text: "Trip Circuit Breakers", details: "Downstream dependency is failing and causing resource exhaustion. Trip breakers to fail fast and preserve system stability." },
  'sol-scaling': { id: 'sol-scaling', type: 'solution', text: "Vertical Scaling / Cache Flush", details: "Queueing detected without downstream saturation. Scale internal workers or flush suspect cache layers causing contention." },
  'sol-injection': { id: 'sol-injection', type: 'solution', text: "Activate Guardrail Mode", details: "Suspected Prompt Injection. Rotate system prompts, enabling strict input validation and PII filtering layers." },
  'sol-drift': { id: 'sol-drift', type: 'solution', text: "Model Version Rollback", details: "Suspected model drift or API update from provider. Revert to fixed model version or adjust temperature/guardrails." },
  'sol-kill-switch': { id: 'sol-kill-switch', type: 'solution', text: "Activate Agent Kill-Switch", details: "Runaway agent detected. Execute global kill-switch to stop all active agent loops and review blast radius." },
  'sol-rag-opt': { id: 'sol-rag-opt', type: 'solution', text: "RAG Pipeline Optimization", details: "Excessive tokens used for retrieval. Review embedding top_k settings and chunking strategies." },
  'sol-region': { id: 'sol-region', type: 'solution', text: "Reroute Traffic", details: "Regional backbone issue detected. Reroute mission-critical traffic to healthy regions while monitoring latency." },
  'sol-cdn': { id: 'sol-cdn', type: 'solution', text: "CDN Cache Purge", details: "Corrupt edge state suspected. Execute PoP-specific cache purge and monitor origin health." },
  'sol-cert': { id: 'sol-cert', type: 'solution', text: "Renew SSL/TLS", details: "Certificate expiry detected. Execute automated renewal or manual rotation immediately." },
  'sol-dns': { id: 'sol-dns', type: 'solution', text: "DNS Propagation Sync", details: "Record mismatch detected. Force TTL expiration if possible or rotate to redundant name servers." },
  'fail-escalate': { id: 'fail-escalate', type: 'failure', text: "Escalate to L3/Principal", details: "Standard diagnostic paths exhausted. Signal-to-noise ratio is low. Initiate P1 War Room immediately." }
};

export const TroubleshootingWizard: React.FC = () => {
  const [history, setHistory] = useState<string[]>(['start']);
  const currentId = history[history.length - 1];
  const currentNode = WIZARD_DATA[currentId];

  const handleOptionClick = (nextId: string) => {
    setHistory([...history, nextId]);
  };

  const handleReset = () => {
    setHistory(['start']);
  };

  const undoLast = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
        <div>
          <h2 className="text-4xl font-black text-zinc-900 dark:text-white mb-2 tracking-tighter uppercase">Diagnosis_Engine_v1</h2>
          <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">Decision-tree based incident isolation. persistent signal tracking.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={undoLast}
            disabled={history.length <= 1}
            className="text-[10px] font-mono text-zinc-500 hover:text-blue-500 disabled:opacity-30 transition-colors uppercase tracking-widest border-b border-transparent hover:border-current pb-0.5"
          >
            [ Step Back ]
          </button>
          <button
            onClick={handleReset}
            className="text-[10px] font-mono text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-widest border-b border-transparent hover:border-current pb-0.5"
          >
            [ Full Reset ]
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        <div className="lg:col-span-4 relative group">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 group-hover:bg-blue-500/30 transition-colors"></div>

          <div className="space-y-6">
            {history.map((stepId, idx) => {
              const node = WIZARD_DATA[stepId];
              const isLast = idx === history.length - 1;
              const isSolution = node.type === 'solution' || node.type === 'failure';

              return (
                <div key={idx} className={`relative pl-10 animate-in slide-in-from-bottom-2 duration-300 ${isLast ? 'opacity-100 scale-105' : 'opacity-40 translate-x-2'}`}>
                  <div className={`absolute left-[11px] top-3.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-black z-10 transition-colors duration-500 ${isSolution ? (node.type === 'solution' ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]') : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                    } ${isLast && !isSolution ? 'animate-pulse' : ''}`}></div>

                  <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm backdrop-blur-sm">
                    <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase block mb-1">
                      {node.type === 'question' ? `LOG_ENTRY_0${idx + 1}` : 'RESULT_STAMP'}
                    </span>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-tight">{node.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">

              <div className="absolute -top-10 -right-10 p-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.2em] border ${currentNode.type === 'solution' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      currentNode.type === 'failure' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                    {currentNode.type === 'question' ? 'AWAITING_SIGNAL' : 'HYPOTHESIS_LOCKED'}
                  </span>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                  <span className="text-[10px] font-mono text-zinc-500 tracking-tighter">REF::{currentNode.id.toUpperCase()}</span>
                </div>

                <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-6 leading-none tracking-tighter">{currentNode.text}</h3>

                {currentNode.details ? (
                  <div className={`p-8 rounded-2xl border-2 mb-8 animate-in zoom-in-95 duration-500 shadow-xl ${currentNode.type === 'solution' ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'
                    }`}>
                    <h4 className={`text-xs font-black uppercase tracking-[0.2em] mb-3 ${currentNode.type === 'solution' ? 'text-green-500' : 'text-red-500'
                      }`}>Recommended_Protocol</h4>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif text-lg">"{currentNode.details}"</p>
                  </div>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 mb-10 font-mono text-xs uppercase tracking-widest italic flex items-center gap-2">
                    <span className="w-1 h-3 bg-blue-500 animate-pulse"></span>
                    Awaiting choice to compute signal path...
                  </p>
                )}

                {currentNode.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentNode.options.map((opt) => (
                      <button
                        key={opt.nextId}
                        onClick={() => handleOptionClick(opt.nextId)}
                        className="group relative flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-950/40 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-800 group-hover:bg-blue-500 transition-all duration-300 shadow-inner"></div>
                          <span className="font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-lg tracking-tight">{opt.label}</span>
                        </div>
                        <svg className="w-5 h-5 text-zinc-300 dark:text-zinc-700 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={handleReset}
                    className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    New_Diagnosis_Trace
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};