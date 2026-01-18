import React, { useState, useRef, useEffect } from 'react';
import { FailureEntry, Category } from '../types';
import { Badge } from './Badge';

interface Props {
  entry: FailureEntry;
  onClick?: (entry: FailureEntry) => void;
}

const getBorderColor = (category: Category) => {
  switch (category) {
    case Category.SECURITY_INCIDENT: return 'rgb(239, 68, 68)'; // red-500
    case Category.PRODUCTION_OUTAGE: return 'rgb(245, 158, 11)'; // amber-500
    case Category.AI_SLOP: return 'rgb(168, 85, 247)'; // purple-500
    case Category.STARTUP_FAILURE: return 'rgb(113, 113, 122)'; // zinc-500
    default: return 'rgb(59, 130, 246)'; // blue-500
  }
};

export const FailureCard: React.FC<Props> = ({ entry, onClick }) => {
  const [showJson, setShowJson] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  // Prevent bubble up when clicking actions
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleCopyMarkdown = () => {
    const md = `### ${entry.title} (${entry.date})
**Severity**: ${entry.severity}
**Category**: ${entry.category}
**Impact**: ${entry.impact || 'N/A'}

> ${entry.description}

*Generated via Awesome Tech Failures*`;
    
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const accentColor = getBorderColor(entry.category);

  return (
    <div 
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onClick && onClick(entry)}
        className="group relative rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 cursor-pointer overflow-hidden transition-colors"
    >
      {/* Spotlight Gradient Effect */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${accentColor}15, transparent 40%)`
        }}
      />
      
      {/* Border Glow */}
      <div 
         className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
         style={{
             opacity,
             background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${accentColor}, transparent 40%)`,
             maskImage: 'linear-gradient(black, black)',
             WebkitMaskImage: 'linear-gradient(black, black)',
             maskComposite: 'exclude',
             WebkitMaskComposite: 'xor',
             padding: '1px' // Thickness of the border glow
         }}
      />
      
      <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <Badge type="category" value={entry.category}>{entry.category}</Badge>
                 <span className="text-zinc-500 text-xs font-mono border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-950/50">{entry.date}</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white leading-tight tracking-tight">
                {entry.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                 {entry.companies.join(' • ')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <Badge type="severity" value={entry.severity}>{entry.severity}</Badge>
            </div>
          </div>

          <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed mb-5 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 py-1">
            {entry.description}
          </p>

          {entry.impact && (
            <div className="mb-5 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/50 flex gap-3 items-start">
              <div className="mt-0.5 text-zinc-400 dark:text-zinc-500">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Impact Analysis</span>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm">{entry.impact}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50 items-center justify-between w-full">
            <div className="flex flex-wrap gap-2">
                {entry.tags.map(tag => (
                <Badge key={tag} type="tag">#{tag}</Badge>
                ))}
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center group-hover:text-blue-500">
                OPEN DOSSIER <span className="ml-1">→</span>
            </span>
          </div>
      </div>
      
      {/* Action Buttons */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-black/70 backdrop-blur-sm rounded-lg p-1">
        <button 
            onClick={(e) => handleAction(e, handleCopyMarkdown)}
            className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors relative"
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
            className={`p-2 rounded transition-colors ${showJson ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
            title="View Raw JSON"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        </button>
        {entry.links.length > 0 && (
            <a 
                href={entry.links[0].url} 
                onClick={(e) => e.stopPropagation()}
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
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
  );
};