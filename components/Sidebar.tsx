import React, { useState, useEffect } from 'react';
import { Category } from '../types';

interface Props {
  currentView: string;
  onChangeView: (view: any) => void;
  selectedCategory: Category | 'All';
  onSelectCategory: (cat: Category | 'All') => void;
  counts: Record<string, number>;
}

const CATEGORIES: Category[] = ['ai-slop', 'outage', 'security', 'startup', 'product', 'decision'];

const NavIcon = ({ active, children }: { active: boolean, children?: React.ReactNode }) => (
  <div className={`mr-2 md:mr-3 transition-colors duration-300 ${active ? 'text-blue-600 dark:text-blue-400 drop-shadow-[0_0_5px_rgba(37,99,235,0.5)] dark:drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-400'}`}>
    {children}
  </div>
);

const ActiveIndicator = ({ active }: { active: boolean }) => (
  <div className={`absolute left-0 bottom-0 top-auto h-0.5 w-full md:w-0.5 md:h-full md:top-0 right-0 md:right-auto bg-blue-600 dark:bg-blue-500 transition-all duration-300 ${active ? 'opacity-100 shadow-[0_0_10px_2px_rgba(59,130,246,0.6)]' : 'opacity-0'}`} />
);

const ActiveGradient = ({ active }: { active: boolean }) => (
  <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-blue-500/10 to-transparent transition-opacity duration-300 pointer-events-none ${active ? 'opacity-100' : 'opacity-0'}`} />
);

const formatCategoryName = (cat: Category): string => {
  const formatMap: Record<Category, string> = {
    'ai-slop': 'AI Slop',
    'outage': 'Outage',
    'security': 'Security',
    'startup': 'Startup',
    'product': 'Product',
    'decision': 'Decision'
  };
  return formatMap[cat] || cat;
};

export const Sidebar: React.FC<Props> = ({
  currentView,
  onChangeView,
  selectedCategory,
  onSelectCategory,
  counts
}) => {
  const [metrics, setMetrics] = useState({ memory: 24, latency: 12, cpu: 4 });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        memory: Math.floor(Math.random() * (64 - 24) + 24),
        latency: Math.floor(Math.random() * (45 - 8) + 8),
        cpu: Math.floor(Math.random() * (15 - 2) + 2)
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const navItemClass = (viewName: string) => `
    group relative flex-shrink-0 md:w-full flex flex-col md:flex-row items-center justify-center md:justify-start px-4 py-4 md:py-3 text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer select-none
    ${currentView === viewName
      ? 'text-zinc-900 dark:text-white bg-zinc-100/50 dark:bg-white/5 md:bg-transparent'
      : 'text-zinc-600 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5'
    }
  `;

  const filterItemClass = (catName: string) => `
    w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 border
    ${selectedCategory === catName
      ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.05)]'
      : 'bg-transparent border-transparent text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-300'
    }
  `;

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-6 md:block">
      <div className="md:sticky md:top-24">
        <div className="border-b md:border-b-0 md:border-l border-zinc-200 dark:border-zinc-800/50 pb-2 md:pb-0 overflow-x-auto md:overflow-visible [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] md:[mask-image:none]">
          <h2 className="hidden md:block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4 px-4">System_Modules</h2>
          <nav className="flex md:flex-col space-x-1 md:space-x-0 md:space-y-0.5 min-w-max px-2 md:px-0">
            <button onClick={() => onChangeView('landing')} className={navItemClass('landing')}>
              <ActiveIndicator active={currentView === 'landing'} />
              <ActiveGradient active={currentView === 'landing'} />
              <NavIcon active={currentView === 'landing'}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </NavIcon>
              <span className="relative z-10 tracking-wide font-mono">DASHBOARD</span>
            </button>

            <button onClick={() => onChangeView('feed')} className={navItemClass('feed')}>
              <ActiveIndicator active={currentView === 'feed'} />
              <ActiveGradient active={currentView === 'feed'} />
              <NavIcon active={currentView === 'feed'}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </NavIcon>
              <span className="relative z-10 tracking-wide font-mono">INDEX_FEED</span>
            </button>

            <button onClick={() => onChangeView('patterns')} className={navItemClass('patterns')}>
              <ActiveIndicator active={currentView === 'patterns'} />
              <ActiveGradient active={currentView === 'patterns'} />
              <NavIcon active={currentView === 'patterns'}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </NavIcon>
              <span className="relative z-10 tracking-wide font-mono">PATTERNS</span>
            </button>

            <button onClick={() => onChangeView('search')} className={navItemClass('search')}>
              <ActiveIndicator active={currentView === 'search'} />
              <ActiveGradient active={currentView === 'search'} />
              <NavIcon active={currentView === 'search'}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </NavIcon>
              <span className="relative z-10 tracking-wide font-mono">SEARCH_EXT</span>
            </button>

            <button onClick={() => onChangeView('analytics')} className={navItemClass('analytics')}>
              <ActiveIndicator active={currentView === 'analytics'} />
              <ActiveGradient active={currentView === 'analytics'} />
              <NavIcon active={currentView === 'analytics'}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </NavIcon>
              <span className="relative z-10 tracking-wide font-mono">ANALYTICS</span>
            </button>

            <button onClick={() => onChangeView('calculator')} className={navItemClass('calculator')}>
              <ActiveIndicator active={currentView === 'calculator'} />
              <ActiveGradient active={currentView === 'calculator'} />
              <NavIcon active={currentView === 'calculator'}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </NavIcon>
              <span className="relative z-10 tracking-wide font-mono">SEVERITY_CALC</span>
            </button>

            <button onClick={() => onChangeView('generator')} className={navItemClass('generator')}>
              <ActiveIndicator active={currentView === 'generator'} />
              <ActiveGradient active={currentView === 'generator'} />
              <NavIcon active={currentView === 'generator'}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </NavIcon>
              <span className="relative z-10 tracking-wide font-mono">REPORT_GEN</span>
            </button>

            <button onClick={() => onChangeView('wizard')} className={navItemClass('wizard')}>
              <ActiveIndicator active={currentView === 'wizard'} />
              <ActiveGradient active={currentView === 'wizard'} />
              <NavIcon active={currentView === 'wizard'}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </NavIcon>
              <span className="relative z-10 tracking-wide font-mono">DIAGNOSE</span>
            </button>

            <button onClick={() => onChangeView('checklist')} className={navItemClass('checklist')}>
              <ActiveIndicator active={currentView === 'checklist'} />
              <ActiveGradient active={currentView === 'checklist'} />
              <NavIcon active={currentView === 'checklist'}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </NavIcon>
              <span className="relative z-10 tracking-wide font-mono">AGENT_PREFLIGHT</span>
            </button>

            <button onClick={() => onChangeView('dev-portal')} className={`${navItemClass('dev-portal')} md:mt-4 md:border-t md:border-zinc-200 md:dark:border-zinc-800/50 md:pt-4`}>
              <ActiveIndicator active={currentView === 'dev-portal'} />
              <ActiveGradient active={currentView === 'dev-portal'} />
              <NavIcon active={currentView === 'dev-portal'}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </NavIcon>
              <span className="relative z-10 tracking-wide font-mono">DEV_API</span>
            </button>
          </nav>
        </div>

        {currentView === 'feed' && (
          <div className="hidden md:block animate-in fade-in slide-in-from-left-2 duration-300 pl-4 border-l border-zinc-200 dark:border-zinc-800/50 mt-8">
            <h2 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">Data_Filters</h2>
            <nav className="space-y-2">
              <button onClick={() => onSelectCategory('All')} className={filterItemClass('All')}>
                <span className="text-[10px] tracking-tight font-mono">ALL_ENTRIES</span>
                <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-0.5 px-1.5 rounded text-[10px] font-mono">{counts['All'] || 0}</span>
              </button>

              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => onSelectCategory(cat)} className={filterItemClass(cat)}>
                  <span className="truncate mr-2 uppercase text-[10px] tracking-tight font-mono">{formatCategoryName(cat).replace(' ', '_')}</span>
                  <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-0.5 px-1.5 rounded text-[10px] font-mono">{counts[cat] || 0}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        <div className="hidden md:block mt-8 px-4 border-t border-zinc-200 dark:border-zinc-800/50 pt-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">System Operational</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>CPU Load:</span>
              <span className="text-zinc-300">{metrics.cpu}%</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>Memory:</span>
              <span className="text-zinc-300">{metrics.memory}MB</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>Latency:</span>
              <span className="text-zinc-300">{metrics.latency}ms</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};