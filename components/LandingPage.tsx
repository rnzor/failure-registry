import React, { useEffect, useState } from 'react';
import { FailureEntry } from '../types';
import { IncidentHeatmap } from './IncidentHeatmap';

interface Props {
  onNavigate: (view: any) => void;
  entries: FailureEntry[];
  onSelectEntry: (entry: FailureEntry) => void;
}

const TERMINAL_LINES = [
  "Initializing failure_index.db...",
  "Loading severity_protocols...",
  "Syncing vector_embeddings...",
  "Detecting failure_patterns...",
  "System Ready."
];

// News Ticker Component
const Ticker: React.FC<{ entries: FailureEntry[]; onSelectEntry: (entry: FailureEntry) => void }> = ({ entries, onSelectEntry }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [contentWidth, setContentWidth] = React.useState(0);

  // Measure content width
  React.useEffect(() => {
    if (containerRef.current) {
      setContentWidth(containerRef.current.scrollWidth / 2);
    }
  }, [entries]);

  // Animation loop
  React.useEffect(() => {
    if (entries.length === 0 || contentWidth === 0) return;

    let animationId: number;
    let lastTime = performance.now();
    const pixelsPerSecond = 20; // Very slow: 20 pixels per second

    const animate = (currentTime: number) => {
      if (!isPaused) {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        setOffset(prev => {
          const newOffset = prev - (pixelsPerSecond * deltaTime);
          if (Math.abs(newOffset) >= contentWidth) {
            return 0;
          }
          return newOffset;
        });
      } else {
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [entries, contentWidth, isPaused]);

  if (entries.length === 0) {
    return null;
  }

  const displayEntries = [...entries, ...entries];

  return (
    <div
      className="w-full bg-zinc-100 dark:bg-black/80 border-y border-zinc-200 dark:border-zinc-800 py-4 overflow-hidden relative flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-100 dark:from-black to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-100 dark:from-black to-transparent z-10 pointer-events-none"></div>

      <div
        ref={containerRef}
        className="flex items-center gap-8 px-4"
        style={{
          transform: `translateX(${offset}px)`,
          willChange: 'transform',
        }}
      >
        {displayEntries.map((entry, i) => {
          const severityLevel = entry.severity?.level || (typeof entry.severity === 'string' ? (entry.severity as string).toLowerCase() : 'medium');
          const year = entry.year || 'N/A';
          return (
            <button
              key={`${entry.id}-${i}`}
              onClick={() => onSelectEntry(entry)}
              className="flex items-center gap-2 text-xs font-mono group cursor-pointer hover:opacity-70 transition-opacity flex-shrink-0"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${severityLevel === 'critical' ? 'bg-red-500' :
                severityLevel === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                }`}></span>
              <span className="text-zinc-500 font-bold">{year}</span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium uppercase whitespace-nowrap">
                {entry.companies?.[0] ? `${entry.companies[0]} // ` : ''}{entry.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};



export const LandingPage: React.FC<Props> = ({ onNavigate, entries, onSelectEntry }) => {
  const [typedText, setTypedText] = useState('');

  const fullText = "Studying failure is a competitive advantage.";

  const criticalCount = entries.filter(e => e.severity.level === 'critical').length;
  const lastIncident = entries.length > 0 ? entries[0] : null;

  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 40);
      return () => clearTimeout(timeout);
    }
  }, [typedText]);

  const glitchStyles = `
    .glitch-text {
      position: relative;
      display: inline-block;
    }
    
    .glitch-text::before,
    .glitch-text::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
    }

    .group:hover .glitch-text::before {
      color: #3b82f6;
      z-index: 1;
      opacity: 0.8;
      animation: glitch-anim-1 0.4s infinite linear alternate-reverse;
    }

    .group:hover .glitch-text::after {
      color: #ec4899;
      z-index: 2;
      opacity: 0.8;
      animation: glitch-anim-2 0.4s infinite linear alternate-reverse;
    }

    @keyframes glitch-anim-1 {
      0% { clip-path: inset(20% 0 80% 0); transform: translate(-4px, 2px); }
      50% { clip-path: inset(60% 0 10% 0); transform: translate(4px, -2px); }
      100% { clip-path: inset(30% 0 20% 0); transform: translate(2px, -1px); }
    }
    
    @keyframes glitch-anim-2 {
      0% { clip-path: inset(10% 0 60% 0); transform: translate(4px, -2px); }
      50% { clip-path: inset(40% 0 40% 0); transform: translate(-4px, 2px); }
      100% { clip-path: inset(50% 0 30% 0); transform: translate(-2px, 1px); }
    }
  `;

  return (
    <div className="flex flex-col items-center min-h-[85vh] animate-in fade-in duration-1000 relative w-full pt-12 md:pt-24 pb-20 overflow-hidden">
      <style>{glitchStyles}</style>

      {/* Hero Background Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="w-full max-w-6xl relative z-10 space-y-16 px-4">

        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.2em] shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span>SYSTEM_NOMINAL</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-zinc-800 dark:text-zinc-200">{entries.length} RECORDS INDEXED</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black text-zinc-900 dark:text-white tracking-[ -0.05em] leading-[0.85] select-none group cursor-default transition-all duration-700">
            <div className="inline-block relative">
              <span className="block glitch-text" data-text="FAILURE">FAILURE</span>
            </div>
            <br />
            <div className="inline-block relative">
              <span className="block glitch-text" data-text="IS">IS</span>
            </div>
            <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 dark:from-blue-500 dark:via-cyan-400 dark:to-blue-600 animate-pulse-slow">
              KNOWLEDGE.
            </span>
          </h1>

          <div className="h-10 flex items-center justify-center">
            <p className="text-lg md:text-2xl text-zinc-500 dark:text-zinc-400 font-light font-mono flex items-center">
              <span className="text-blue-600 dark:text-blue-500 mr-3 hidden sm:inline">signal@node:~$</span>
              {typedText}
              <span className="animate-pulse ml-1 inline-block w-3 h-6 bg-blue-600 dark:bg-blue-500 align-middle"></span>
            </p>
          </div>
        </div>

        <div className="w-full scale-[1.02] md:scale-100">
          <Ticker entries={entries} onSelectEntry={onSelectEntry} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Temporal_Incident_Map</h3>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
              </div>
            </div>
            <IncidentHeatmap entries={entries} />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <button
              onClick={() => onNavigate('feed')}
              className="w-full group relative px-8 py-8 bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-2xl rounded-3xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex flex-col items-center">
                <span className="uppercase tracking-tighter">Enter_The_Index</span>
                <span className="text-[10px] font-mono mt-2 opacity-50 font-bold tracking-[0.4em]">START_RESEARCH</span>
              </span>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onNavigate('patterns')}
                className="p-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500/50 transition-all group flex flex-col items-center justify-center gap-2"
              >
                <svg className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Patterns</span>
              </button>
              <button
                onClick={() => onNavigate('dev-portal')}
                className="p-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500/50 transition-all group flex flex-col items-center justify-center gap-2"
              >
                <svg className="w-6 h-6 text-zinc-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Dev_Api</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-12 border-t border-zinc-200 dark:border-zinc-800/80">
          <div className="p-8 bg-white/40 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl text-center backdrop-blur-md shadow-inner transition-all hover:border-blue-500/20">
            <div className="text-4xl font-black text-zinc-900 dark:text-white font-mono tracking-tighter">{entries.length}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mt-2">Dossier_Volume</div>
          </div>
          <div className="p-8 bg-white/40 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl text-center backdrop-blur-md shadow-inner transition-all hover:border-red-500/20">
            <div className="text-4xl font-black text-red-600 dark:text-red-500 font-mono tracking-tighter">{criticalCount}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mt-2">Critical_Threats</div>
          </div>
          <div className="p-8 bg-white/40 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl text-center backdrop-blur-md shadow-inner transition-all hover:border-blue-500/20">
            <div className="text-4xl font-black text-blue-600 dark:text-blue-500 font-mono tracking-tighter">100%</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mt-2">Verification_QA</div>
          </div>
          <div className="p-8 bg-white/40 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl text-center backdrop-blur-md shadow-inner transition-all hover:border-zinc-400/20">
            <div className="text-4xl font-black text-zinc-900 dark:text-white font-mono tracking-tighter">{lastIncident ? lastIncident.year : 'N/A'}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mt-2">Latest_Capture</div>
          </div>
        </div>
      </div>
    </div>
  );
};