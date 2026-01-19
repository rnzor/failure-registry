import React, { useEffect, useState, useRef } from 'react';
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

const CATEGORIES: Category[] = ['ai-slop', 'outage', 'security', 'startup', 'product', 'decision'];

export const CommandPalette: React.FC<Props> = ({
  isOpen,
  onClose,
  entries,
  onNavigate,
  onToggleTheme,
  onSelectEntry,
  onCategoryJump
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      group: 'Navigation',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      action: () => onNavigate('landing')
    },
    {
      id: 'nav-feed',
      label: 'Go to Failure Index',
      group: 'Navigation',
      icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
      action: () => onNavigate('feed')
    },
    {
      id: 'nav-patterns',
      label: 'Explore Patterns',
      group: 'Navigation',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      action: () => onNavigate('patterns')
    },
    {
      id: 'nav-search',
      label: 'Semantic Search Engine',
      group: 'Navigation',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      action: () => onNavigate('search')
    },
    {
      id: 'nav-analytics',
      label: 'Analytics Dashboard',
      group: 'Navigation',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      action: () => onNavigate('analytics')
    },
    {
      id: 'action-theme',
      label: 'Toggle UI Mode (Light/Dark)',
      group: 'System',
      icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
      action: onToggleTheme
    }
  ];

  const categoryCommands = onCategoryJump ? CATEGORIES.map(cat => ({
    id: `cat-${cat}`,
    label: `Filter by ${cat.toUpperCase()}`,
    group: 'Categories',
    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    action: () => onCategoryJump(cat)
  })) : [];

  const allCommands = [...commands, ...categoryCommands];

  const filteredEntries = entries.filter(e =>
    e.title.toLowerCase().includes(query.toLowerCase()) ||
    e.companies.some(c => c.toLowerCase().includes(query.toLowerCase())) ||
    e.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 5);

  const filteredCommands = allCommands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const combinedItems = [
    ...filteredCommands.map(c => ({ type: 'command' as const, data: c })),
    ...filteredEntries.map(e => ({ type: 'entry' as const, data: e }))
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % combinedItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + combinedItems.length) % combinedItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = combinedItems[activeIndex];
      if (item) {
        if (item.type === 'command') {
          item.data.action();
        } else {
          onSelectEntry(item.data);
        }
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col backdrop-blur-2xl">

        <div className="flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none focus:ring-0 py-6 px-4 text-xl text-zinc-900 dark:text-white placeholder-zinc-500 font-mono font-bold"
            placeholder="Search commands or entries..."
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <div className="hidden items-center gap-2 sm:flex">
            <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-500 font-mono">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
          {combinedItems.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest">No_Results_Found</div>
          ) : (
            combinedItems.map((item, idx) => {
              const active = idx === activeIndex;
              const isCommand = item.type === 'command';

              return (
                <div
                  key={isCommand ? item.data.id : item.data.id}
                  className={`px-6 py-4 cursor-pointer flex items-center justify-between transition-colors ${active
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  onClick={() => {
                    if (isCommand) item.data.action();
                    else onSelectEntry(item.data);
                    onClose();
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className="flex items-center gap-4">
                    {isCommand ? (
                      <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.data.icon} />
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.data.severity.level === 'critical' ? 'bg-red-500' :
                          item.data.severity.level === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                        } ${active ? 'ring-4 ring-white/20' : ''}`}></div>
                    )}

                    <div className="flex flex-col">
                      <span className={`font-bold ${active ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {isCommand ? item.data.label : item.data.title}
                      </span>
                      {!isCommand && (
                        <span className={`text-[10px] uppercase font-mono tracking-tight ${active ? 'text-blue-100' : 'text-zinc-500'}`}>
                          {item.data.companies.join(', ')} • {item.data.year} • {item.data.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {isCommand && (
                    <span className={`text-[10px] uppercase tracking-widest font-mono font-bold ${active ? 'text-blue-200' : 'text-zinc-400'}`}>
                      {item.data.group}
                    </span>
                  )}
                  {!isCommand && (
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${active
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500'
                      }`}>
                      INDEX_ENTRY
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-[10px] text-zinc-400 font-mono flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>SELECT_ENTRY [ENTER]</span>
            <span>NAVIGATE [↑↓]</span>
          </div>
          <span className="opacity-50">INDEX_KERNEL_V2</span>
        </div>
      </div>
    </div>
  );
};