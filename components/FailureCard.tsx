import React, { useState, useRef } from 'react';
import { FailureEntry } from '../types';
import { Badge } from './Badge';

interface Props {
  entry: FailureEntry;
  onClick?: (entry: FailureEntry) => void;
}

export const FailureCard: React.FC<Props> = ({ entry, onClick }) => {
  const [showJson, setShowJson] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isRootHovered, setIsRootHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsRootHovered(false);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleCopyMarkdown = () => {
    const md = `### ${entry.title} (${entry.year})
**Severity**: ${entry.severity.level.toUpperCase()} (Score: ${entry.severity.score || 'N/A'})
**Category**: ${entry.category}
**Cause**: ${entry.cause}
**Impact**: ${entry.impact?.join(', ') || 'N/A'}

> ${entry.summary}

*Generated via Awesome Tech Failures*`;

    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className={`card-3d-container h-full ${isHovered ? 'z-50 relative' : 'relative'}`}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onClick && onClick(entry)}
        className="card-3d group relative rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 cursor-pointer h-full flex flex-col transition-all duration-300"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative z-10 flex flex-col h-full" style={{ transformStyle: 'preserve-3d' }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge type="category" value={entry.category}>{entry.category}</Badge>
                <span className="text-zinc-600 dark:text-zinc-400 text-xs font-mono border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-950/50">{entry.year}</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white leading-tight tracking-tight">
                {entry.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 font-mono">
                {entry.companies.join(' • ')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge type="severity" value={entry.severity.level}>{entry.severity.level}</Badge>
            </div>
          </div>

          {/* Pattern Hint */}
          {entry.patterns && entry.patterns.length > 0 && (
            <div className="mb-2 flex items-center gap-1.5 overflow-hidden">
              <span className="text-[10px] font-mono font-black text-blue-500 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">Pattern</span>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate italic">"{entry.patterns[0]}"</span>
            </div>
          )}

          {/* Summary Description */}
          <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed mb-4 line-clamp-2">
            {entry.summary}
          </p>

          {/* Root Cause Section */}
          {entry.root_cause && (
            <div
              className="relative mt-2 mb-6"
              style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
              onMouseEnter={() => setIsRootHovered(true)}
              onMouseLeave={() => setIsRootHovered(false)}
              onClick={(e) => { e.stopPropagation(); setIsRootHovered(!isRootHovered); }}
            >
              <span className={`forensic-label absolute -top-4 left-0 transition-opacity duration-300 ${isRootHovered ? 'opacity-100 digital-blink text-red-500' : 'opacity-0'}`}>
                PRIMARY FAILURE VECTOR
              </span>

              {/* Base Layer (Solid reference at rest) */}
              <div className={`p-3 rounded-none border-2 transition-opacity duration-300 ${isRootHovered ? 'opacity-0' : 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50'}`}>
                <span className="text-[10px] uppercase tracking-wider text-red-600 dark:text-red-400 font-bold block mb-1">Root Cause</span>
                <p className="text-zinc-800 dark:text-zinc-300 text-sm font-bold line-clamp-2">{entry.root_cause}</p>
              </div>

              {/* Extracted Layer (Direct interaction layer) */}
              <div
                className={`absolute -inset-4 h-fit min-h-full p-4 rounded-none border transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${isRootHovered ? 'opacity-100 shadow-[0_0_50px_rgba(239,68,68,0.4),0_0_150px_100px_rgba(0,0,0,0.95)] z-50' : 'opacity-0 pointer-events-none'
                  } bg-zinc-950 border-red-500/30 flex flex-col`}
                style={{
                  transform: isRootHovered ? 'translateZ(120px) rotateX(-1deg)' : 'translateZ(0)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Terminal Header */}
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/40" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                    <div className="w-2 h-2 rounded-full bg-green-500/40" />
                  </div>
                  <span className="text-[8px] font-mono text-red-500/40 uppercase tracking-[0.3em]">sec_dossier_v2.0.26</span>
                </div>

                {/* Terminal Body */}
                <div className="font-mono text-[11px] flex-1 overflow-visible flex flex-col min-h-[80px]">
                  <div className="flex items-center gap-2 text-red-500/80 mb-2">
                    <span className="shrink-0 animate-pulse">#</span>
                    <span className="typing-command">fetch("https://rnzor.github.io/awesome-tech-failures/api/v1/failures.json")</span>
                  </div>

                  <div className="flex-1">
                    <div className="text-zinc-400 text-[9px] mb-2 border-l border-red-500/20 pl-2">
                      [INFO] Decrypting forensic payload... Done.<br />
                      [INFO] Isolating primary failure vector...
                    </div>
                    <p className="text-zinc-100 leading-relaxed font-bold whitespace-pre-wrap">
                      {entry.root_cause}
                      <span className="cursor ml-1" />
                    </p>
                  </div>

                  <div className="mt-auto pt-2 text-[8px] text-zinc-700 flex justify-between font-mono border-t border-white/5">
                    <span>SEVERITY: {entry.severity.level}</span>
                    <span>ID: {entry.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                {/* Brackets */}
                <div className="corner-bracket corner-tl border-red-500/40" />
                <div className="corner-bracket corner-tr border-red-500/40" />
                <div className="corner-bracket corner-bl border-red-500/40" />
                <div className="corner-bracket corner-br border-red-500/40" />
              </div>
            </div>
          )}

          {/* Metadata Footer */}
          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50 items-center justify-between w-full">
            <div className="flex flex-wrap gap-2">
              <Badge type="tag">{entry.cause}</Badge>
              {entry.stage && <Badge type="tag">{entry.stage}</Badge>}
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center group-hover:text-red-500">
              OPEN DOSSIER <span className="ml-1">→</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-black/70 backdrop-blur-sm rounded-lg p-1">
          <button
            onClick={(e) => handleAction(e, handleCopyMarkdown)}
            className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors relative"
            title="Copy as Markdown"
          >
            {copiedMd ? (
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            )}
          </button>
          <button
            onClick={(e) => handleAction(e, () => setShowJson(!showJson))}
            className={`p-2 rounded transition-colors ${showJson ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
            title="View Raw JSON"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          </button>
          {entry.sources && entry.sources.length > 0 && (
            <a
              href={entry.sources[0].url}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          )}
        </div>

        {showJson && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200 relative z-20" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 right-0 px-2 py-1 bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 rounded-bl font-mono">JSON</div>
            <pre className="p-4 bg-zinc-100 dark:bg-black/50 rounded-lg text-xs font-mono text-blue-600 dark:text-blue-300 overflow-x-auto border border-zinc-200 dark:border-zinc-800/50 shadow-inner">
              {JSON.stringify(entry, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
