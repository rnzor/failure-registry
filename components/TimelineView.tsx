import React from 'react';
import { FailureEntry } from '../types';
import { Badge } from './Badge';

interface Props {
  entries: FailureEntry[];
  onSelect: (entry: FailureEntry) => void;
}

export const TimelineView: React.FC<Props> = ({ entries, onSelect }) => {
  const sorted = [...entries].sort((a, b) => b.year - a.year);

  // Group by year
  const groupedFailures: Record<number, FailureEntry[]> = {};
  sorted.forEach(entry => {
    if (!groupedFailures[entry.year]) {
      groupedFailures[entry.year] = [];
    }
    groupedFailures[entry.year].push(entry);
  });

  const years = Object.keys(groupedFailures).map(Number).sort((a, b) => b - a);

  return (
    <div className="relative py-10 px-4 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="absolute left-8 md:left-1/2 top-10 bottom-0 w-px bg-gradient-to-b from-blue-500 via-zinc-700 to-transparent md:-translate-x-1/2 opacity-30"></div>

      <div className="space-y-24">
        {years.map((year) => (
          <div key={year} className="relative">
            {/* Year Header */}
            <div className="sticky top-20 z-20 flex justify-center mb-12">
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-6 py-1.5 rounded-full shadow-xl">
                <span className="text-xl font-black text-zinc-900 dark:text-white tracking-widest font-mono">{year}</span>
              </div>
            </div>

            <div className="space-y-12">
              {groupedFailures[year].map((entry, idx) => {
                const isLeft = idx % 2 === 0;
                const severityLevel = entry.severity.level;
                const severityColor =
                  severityLevel === 'critical' ? 'bg-red-500 shadow-red-500/50' :
                    severityLevel === 'high' ? 'bg-orange-500 shadow-orange-500/50' :
                      severityLevel === 'medium' ? 'bg-yellow-500 shadow-yellow-500/50' :
                        'bg-blue-500 shadow-blue-500/50';

                return (
                  <div key={entry.id} className={`relative flex flex-col md:flex-row items-center ${isLeft ? 'md:flex-row-reverse' : ''} group`}>

                    {/* Visual Indicator Line (Mobile) */}
                    <div className="absolute left-8 md:left-1/2 h-full w-px bg-zinc-800 md:hidden"></div>

                    {/* Metadata Card (Desktop) */}
                    <div className={`hidden md:block w-1/2 px-12 ${isLeft ? 'text-left' : 'text-right'}`}>
                      <div className="font-mono text-[10px] text-zinc-500 mb-1 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                        {entry.companies.join(' & ')}
                      </div>
                      <div className="text-zinc-600 dark:text-zinc-500 text-[9px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 duration-300">
                        PLATFORM_FAIL_ID: {entry.id.toUpperCase()}
                      </div>
                    </div>

                    {/* Center Node */}
                    <div className="absolute left-8 md:left-1/2 w-6 h-6 rounded-full bg-zinc-900 border-2 border-zinc-700 z-10 md:-translate-x-1/2 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <div className={`w-2 h-2 rounded-full ${severityColor} shadow-lg group-hover:animate-pulse`}></div>
                    </div>

                    {/* Content Card */}
                    <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-12">
                      <div
                        onClick={() => onSelect(entry)}
                        className="group relative bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-xl"
                      >
                        {/* Severity Accent */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${severityColor}`}></div>

                        <div className="flex justify-between items-start mb-3">
                          <Badge type="category" value={entry.category} className="text-[9px] py-0 px-1.5 font-mono uppercase tracking-widest">{entry.category}</Badge>
                          {severityLevel === 'critical' && (
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-zinc-900 dark:text-white font-bold text-lg mb-2 leading-tight group-hover:text-blue-500 transition-colors uppercase tracking-tight">{entry.title}</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-4 font-serif">
                          {entry.summary}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex gap-1.5">
                            {entry.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[9px] text-zinc-500 font-mono border border-zinc-200 dark:border-zinc-800 px-1 rounded uppercase tracking-tighter">#{tag}</span>
                            ))}
                          </div>
                          <div className="flex items-center text-[9px] text-blue-600 dark:text-blue-500 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Dossier</span>
                            <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-24 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-black text-zinc-500 dark:text-zinc-600 text-xs font-mono tracking-widest">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          END_OF_RECORD_TRANSMISSION
        </div>
      </div>
    </div>
  );
};