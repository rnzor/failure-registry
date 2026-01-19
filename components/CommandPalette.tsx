import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FailureEntry, Category } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entries: FailureEntry[];
  onNavigate: (view: any) => void;
  onToggleTheme: () => void;
  onSelectEntry: (entry: FailureEntry) => void;
  onCategoryJump?: (cat: Category) => void;
}

export const CommandPalette: React.FC<Props> = ({
  isOpen,
  onClose,
  entries,
  onNavigate,
  onToggleTheme,
  onSelectEntry
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<'quick' | 'results'>('quick');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Quick actions with a more technical styling
  const quickActions = [
    { id: 'feed', label: 'INDEX_FEED', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', desc: 'Browse full database', action: () => onNavigate('feed') },
    { id: 'search', label: 'NEURAL_SEARCH', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', desc: 'Semantic analysis', action: () => onNavigate('search') },
    { id: 'patterns', label: 'PATTERN_RECOG', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', desc: 'Identify clusters', action: () => onNavigate('patterns') },
    { id: 'analytics', label: 'SYS_ANALYTICS', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', desc: 'Global metrics', action: () => onNavigate('analytics') },
  ];

  // Search results logic
  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return entries.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.companies?.some(c => c.toLowerCase().includes(q)) ||
      e.tags?.some(t => t.toLowerCase().includes(q)) ||
      e.category?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [query, entries]);

  const hasResults = searchResults.length > 0;

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (hasResults && activeSection === 'results') {
        onSelectEntry(searchResults[activeIndex]);
        onClose();
      } else if (activeSection === 'quick') {
        quickActions[activeIndex]?.action();
        onClose();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hasResults && activeSection === 'quick') {
        setActiveSection('results');
        setActiveIndex(0);
      } else {
        const max = activeSection === 'quick' ? quickActions.length : searchResults.length;
        setActiveIndex(prev => Math.min(prev + 1, max - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex === 0 && activeSection === 'results') {
        setActiveSection('quick');
        setActiveIndex(quickActions.length - 1);
      } else {
        setActiveIndex(prev => Math.max(prev - 1, 0));
      }
    }
  };

  useEffect(() => {
    if (query.length < 2) {
      setActiveSection('quick');
      setActiveIndex(0);
    }
  }, [query]);

  if (!isOpen) return null;

  const getSeverityColor = (level?: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 font-mono">
      {/* Darkened Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Main Terminal Window */}
      <div className="relative w-full max-w-2xl bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/5">

        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <span className="ml-2 text-[10px] text-zinc-500 font-bold tracking-widest uppercase">root@system:~/commands</span>
          </div>
          <div className="text-[10px] text-zinc-600 font-bold">V 2.0.4</div>
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/50">
          <span className="text-blue-500 font-bold text-lg animate-pulse">{'>_'}</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-lg text-white placeholder-zinc-600 font-bold tracking-tight caret-blue-500"
            placeholder="Execute command or search failure database..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <kbd className="hidden sm:inline-flex px-2 py-1 text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-400 rounded-sm">
            ESC
          </kbd>
        </div>

        {/* Quick Actions Grid */}
        <div className="p-3 bg-zinc-900/30">
          <div className="px-2 pb-2 text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
            Available_Modules
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quickActions.map((action, idx) => {
              const isActive = activeSection === 'quick' && activeIndex === idx;
              return (
                <button
                  key={action.id}
                  onClick={() => { action.action(); onClose(); }}
                  onMouseEnter={() => { setActiveSection('quick'); setActiveIndex(idx); }}
                  className={`group relative flex flex-col items-start p-3 rounded border transition-all duration-200 ${isActive
                      ? 'bg-blue-500/10 border-blue-500/50'
                      : 'bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700'
                    }`}
                >
                  {/* Selection Indicator Corner */}
                  {isActive && <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500"></div>}
                  {isActive && <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500"></div>}

                  <div className={`mb-2 p-1.5 rounded ${isActive ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                    </svg>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-400' : 'text-zinc-400'}`}>
                    {action.label}
                  </span>
                  <span className="text-[9px] text-zinc-600 mt-1 truncate w-full">
                    {action.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Results Area */}
        {(hasResults || query.length >= 2) && (
          <div className="border-t border-zinc-800" ref={listRef}>
            <div className="px-5 py-2 bg-zinc-900/80 border-b border-zinc-800 text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex justify-between items-center">
              <span>Query_Results</span>
              <span>{searchResults.length} Matches Found</span>
            </div>

            {hasResults ? (
              <div className="max-h-[300px] overflow-y-auto">
                {searchResults.map((entry, idx) => {
                  const isActive = activeSection === 'results' && activeIndex === idx;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => { onSelectEntry(entry); onClose(); }}
                      onMouseEnter={() => { setActiveSection('results'); setActiveIndex(idx); }}
                      className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors border-l-2 ${isActive
                          ? 'bg-zinc-800/80 border-l-blue-500'
                          : 'bg-transparent border-l-transparent hover:bg-zinc-900/40'
                        }`}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getSeverityColor(entry.severity?.level)}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                          {entry.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 uppercase tracking-wide">
                          <span className={`${isActive ? 'text-blue-300' : 'text-zinc-500'}`}>{entry.year}</span>
                          <span>//</span>
                          <span className={`${isActive ? 'text-blue-300' : 'text-zinc-500'}`}>{entry.category}</span>
                          {entry.companies && entry.companies.length > 0 && (
                            <>
                              <span>//</span>
                              <span>{entry.companies[0]}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {isActive && (
                        <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest opacity-80 animate-pulse">
                          Access_Link
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-zinc-900/20">
                <div className="inline-block p-3 rounded-full bg-zinc-900 mb-3 border border-zinc-800">
                  <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider">No_Data_Found</div>
                <div className="text-zinc-600 text-[10px] mt-1">Make sure search term is correct</div>
              </div>
            )}
          </div>
        )}

        {/* Action Footer */}
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-400 border border-zinc-700">↑↓</kbd>
              NAVIGATE
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-400 border border-zinc-700">↵</kbd>
              EXECUTE
            </span>
          </div>

          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 text-[9px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-wider transition-colors"
          >
            <span>TOGGLE_THEME</span>
            <div className={`w-2 h-2 rounded-full border border-zinc-600 ${document.documentElement.classList.contains('dark') ? 'bg-zinc-400' : 'bg-transparent'}`}></div>
          </button>
        </div>
      </div>
    </div>
  );
};