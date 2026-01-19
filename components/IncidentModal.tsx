import React, { useEffect, useState, useMemo } from 'react';
import { FailureEntry, Category } from '../types';
import { Badge } from './Badge';

interface Props {
  entry: FailureEntry;
  allEntries?: FailureEntry[];
  onClose: () => void;
  onSelectEntry?: (entry: FailureEntry) => void;
}

const AI_ANALYSIS_TEMPLATES: Record<Category, string[]> = {
  'ai-slop': [
    "DETECTED: Model Hallucination / Alignment Failure.",
    "RECOMMENDATION: Implement RLHF (Reinforcement Learning from Human Feedback) on adversarial datasets.",
    "ACTION: Audit training data for bias. Restrict output tokens. Increase temperature thresholds."
  ],
  'outage': [
    "DETECTED: Availability Drop / SLO Breach.",
    "RECOMMENDATION: Immediate rollback to Last Known Good (LKG) artifact.",
    "ACTION: Check load balancer health. Flush distributed caches. Scale read-replicas."
  ],
  'security': [
    "DETECTED: Unauthorized Access / CVE Exploitation.",
    "RECOMMENDATION: Isolate affected subnets immediately.",
    "ACTION: Rotate all API keys and session tokens. Patch vulnerability. Initiate forensic log dump."
  ],
  'startup': [
    "DETECTED: Burn Rate Critical / PMF Mismatch.",
    "RECOMMENDATION: Pivot or Liquidate assets.",
    "ACTION: Review unit economics. The market does not exist for this solution."
  ],
  'product': [
    "DETECTED: User Churn / Usability Heuristic Violation.",
    "RECOMMENDATION: Simplify critical user journey.",
    "ACTION: Revert UI changes. Conduct user interviews. Apologize publicly."
  ],
  'decision': [
    "DETECTED: Strategic Misalignment / Governance Failure.",
    "RECOMMENDATION: Re-evaluate decision-making framework.",
    "ACTION: Conduct post-mortem on corporate governance. Audit incentive structure."
  ]
};

export const IncidentModal: React.FC<Props> = ({ entry, allEntries = [], onClose, onSelectEntry }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'ai'>('details');
  const [aiText, setAiText] = useState('');

  const currentIndex = allEntries.findIndex(e => e.id === entry.id);
  const prevEntry = currentIndex > 0 ? allEntries[currentIndex - 1] : null;
  const nextEntry = currentIndex < allEntries.length - 1 ? allEntries[currentIndex + 1] : null;

  const relatedEntries = useMemo(() => {
    return allEntries
      .filter(e => e.category === entry.category && e.id !== entry.id)
      .slice(0, 3);
  }, [entry, allEntries]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && nextEntry && onSelectEntry) onSelectEntry(nextEntry);
      if (e.key === 'ArrowLeft' && prevEntry && onSelectEntry) onSelectEntry(prevEntry);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, nextEntry, prevEntry, onSelectEntry]);

  useEffect(() => {
    setActiveTab('details');
    setAiText('');
  }, [entry]);

  useEffect(() => {
    if (activeTab === 'ai' && !aiText) {
      const lines = AI_ANALYSIS_TEMPLATES[entry.category] || AI_ANALYSIS_TEMPLATES['outage'];
      const fullText = `> INITIALIZING AGENT...\n> ANALYZING ${entry.id.toUpperCase()}...\n\n` + lines.join('\n\n') + `\n\n> GENERATION COMPLETE.`;

      let i = 0;
      const interval = setInterval(() => {
        setAiText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) clearInterval(interval);
      }, 15);
      return () => clearInterval(interval);
    }
  }, [activeTab, entry, aiText]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const severityColor =
    entry.severity.level === 'critical' ? 'text-red-500 border-red-500 shadow-red-500/20' :
      entry.severity.level === 'high' ? 'text-orange-500 border-orange-500 shadow-orange-500/20' :
        'text-blue-400 border-blue-400 shadow-blue-400/20';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      {prevEntry && onSelectEntry && (
        <button
          onClick={() => onSelectEntry(prevEntry)}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-4 text-zinc-500 hover:text-white transition-colors hover:scale-110 z-[110]"
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {nextEntry && onSelectEntry && (
        <button
          onClick={() => onSelectEntry(nextEntry)}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-4 text-zinc-500 hover:text-white transition-colors hover:scale-110 z-[110]"
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5l7 7-7 7" /></svg>
        </button>
      )}

      <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">

        <div className={`h-1.5 w-full bg-gradient-to-r from-transparent via-${entry.severity.level === 'critical' ? 'red' : 'blue'}-500 to-transparent opacity-50`} />

        <div className="flex justify-between items-start p-6 border-b border-zinc-800 bg-zinc-900/30">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`font-mono text-xs font-bold px-2 py-0.5 border rounded ${severityColor} bg-opacity-10 bg-current uppercase`}>
                {entry.severity.level} CLEARANCE {entry.severity.score ? `- LVL ${entry.severity.score}` : ''}
              </span>
              <span className="font-mono text-xs text-zinc-500">CASE ID: {entry.id.toUpperCase()}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">{entry.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex border-b border-zinc-800 bg-zinc-950/50">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'details' ? 'bg-zinc-900 text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
          >
            Incident Dossier
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-zinc-900 text-purple-400 border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            AI Analysis
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">

          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6 md:col-span-1 border-r border-zinc-800/50 pr-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Year of Incident</label>
                  <div className="font-mono text-zinc-200 text-lg">{entry.year}</div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Entities Involved</label>
                  <div className="flex flex-col gap-1">
                    {entry.companies.map(c => (
                      <span key={c} className="font-medium text-zinc-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></span>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Classification</label>
                  <Badge type="category" value={entry.category}>{entry.category}</Badge>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Failure Cause</label>
                  <div className="font-mono text-blue-400 text-sm py-1 capitalize">{entry.cause.replace('-', ' ')}</div>
                </div>

                {entry.stage && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Complexity Stage</label>
                    <div className="font-mono text-zinc-400 text-sm py-1 capitalize">{entry.stage}</div>
                  </div>
                )}

                {entry.evidence_type && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Evidence Quality</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${entry.evidence_type === 'direct_incident' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      <span className="text-xs text-zinc-300 font-mono uppercase">{entry.evidence_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">System Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags?.map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded bg-zinc-900/50">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                {entry.root_cause && (
                  <div className="bg-red-950/20 p-5 rounded-lg border border-red-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                      <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      Root Cause Analysis
                    </h3>
                    <p className="text-red-100/90 leading-relaxed font-medium text-base relative z-10">
                      {entry.root_cause}
                    </p>
                  </div>
                )}

                <div className="bg-zinc-900/20 p-5 rounded-lg border border-zinc-800/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <svg className="w-16 h-16 text-zinc-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Executive Summary</h3>
                  <p className="text-zinc-200 leading-relaxed text-sm md:text-base">
                    {entry.summary}
                  </p>
                </div>

                {entry.severity.financial && entry.severity.financial !== 'N/A' && (
                  <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Financial Impact</span>
                    <span className="text-xl font-mono text-white">{entry.severity.financial}</span>
                  </div>
                )}

                {entry.lessons && entry.lessons.length > 0 && (
                  <div className="border border-blue-900/30 bg-blue-950/10 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Key Lessons Learned
                    </h3>
                    <ul className="space-y-3">
                      {entry.lessons.map((lesson, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-blue-100/80 leading-relaxed">
                          <span className="text-blue-500 font-mono mt-0.5">{`0${idx + 1}`}</span>
                          <span>{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {entry.patterns && entry.patterns.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Detected Patterns</h3>
                    <div className="flex flex-wrap gap-2">
                      {entry.patterns.map(pattern => (
                        <span key={pattern} className="px-3 py-1.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium uppercase tracking-wide">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.impact && entry.impact.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-red-500/50 rounded-full"></span>
                      Impact Analysis
                    </h3>
                    <div className="bg-zinc-950 border border-zinc-800 rounded p-4 flex flex-wrap gap-2 shadow-inner">
                      {entry.impact.map(imp => (
                        <span key={imp} className="font-mono text-xs text-red-200/80 uppercase border border-red-900/30 px-2 py-0.5 rounded">
                          {imp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.sources && entry.sources.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Evidence & Artifacts</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {entry.sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 bg-zinc-900/40 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-900 transition-all rounded group"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`p-1.5 rounded bg-zinc-800 ${source.kind === 'primary' ? 'text-yellow-400' : 'text-blue-400'}`}>
                              {source.kind === 'primary' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                              )}
                            </span>
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{source.title}</span>
                          </div>
                          <svg className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {relatedEntries.length > 0 && onSelectEntry && (
                  <div className="pt-8 border-t border-zinc-800">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Related Failures</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {relatedEntries.map(rel => (
                        <div
                          key={rel.id}
                          onClick={() => onSelectEntry(rel)}
                          className="p-3 bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-600 cursor-pointer group/card transition-colors"
                        >
                          <div className="text-xs text-zinc-500 mb-1">{rel.year}</div>
                          <div className="font-bold text-zinc-300 group-hover/card:text-white text-sm truncate">{rel.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col font-mono">
              <div className="flex-1 bg-black p-4 rounded border border-zinc-800 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-green-400 leading-relaxed">
                  {aiText}
                  <span className="animate-pulse inline-block w-2 h-4 bg-green-500 align-middle ml-1"></span>
                </pre>
              </div>
              <div className="mt-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded text-xs text-zinc-500">
                DISCLAIMER: This analysis is generated by a simulated AI agent based on failure categorization tags. Do not use for production incident response without human verification.
              </div>
            </div>
          )}
        </div>

        <div className="bg-black border-t border-zinc-800 p-3 flex justify-between items-center text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
          <span>SECURE CONNECTION ESTABLISHED</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">USE ARROW KEYS TO NAVIGATE</span>
            <span className="animate-pulse text-green-500">● LIVE ARCHIVE ACCESS</span>
          </div>
        </div>

      </div>
    </div>
  );
};