import React, { useState, useEffect, useMemo, useRef } from 'react';
import Fuse from 'fuse.js';
import { loadFailures } from './services/dataService';
import { FailureEntry, Category } from './types';
import { FailureCard } from './components/FailureCard';
import { Sidebar } from './components/Sidebar';
import { SeverityCalculator } from './components/SeverityCalculator';
import { TroubleshootingWizard } from './components/TroubleshootingWizard';
import { AgentChecklist } from './components/AgentChecklist';
import { DeveloperPortal } from './components/DeveloperPortal';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { TimelineView } from './components/TimelineView';
import { IncidentModal } from './components/IncidentModal';
import { CommandPalette } from './components/CommandPalette';
import { StatsDashboard } from './components/StatsDashboard';
import { PostMortemGenerator } from './components/PostMortemGenerator';
import { SimilaritySearch } from './components/SimilaritySearch';
import { CardSkeleton } from './components/ui/Skeleton';
import { useVersion } from './hooks/useVersion';
import { PatternsView } from './components/PatternsView';

type ViewState = 'landing' | 'feed' | 'calculator' | 'wizard' | 'checklist' | 'dev-portal' | 'analytics' | 'generator' | 'search' | 'patterns';
type FeedMode = 'list' | 'timeline';
type Theme = 'dark' | 'light';

const CATEGORIES: (Category | 'All')[] = ['All', 'ai-slop', 'outage', 'security', 'startup', 'product', 'decision'];

function App() {
  const [entries, setEntries] = useState<FailureEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [feedMode, setFeedMode] = useState<FeedMode>('list');
  const [selectedEntry, setSelectedEntry] = useState<FailureEntry | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { version } = useVersion();

  const reqId = useMemo(() => Math.floor(Math.random() * 9000) + 1000, []);

  const fuse = useMemo(() => {
    return new Fuse(entries, {
      keys: ['title', 'summary', 'companies', 'tags', 'root_cause'],
      threshold: 0.3,
      includeScore: true
    });
  }, [entries]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await loadFailures();
        const sorted = data.sort((a, b) => b.year - a.year);
        setEntries(sorted);
      } catch (err) {
        console.error("Failed to load entries", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (isCmdOpen) {
          setIsCmdOpen(false);
        } else if (selectedEntry) {
          setSelectedEntry(null);
        } else if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        } else if (searchTerm) {
          setSearchTerm('');
        } else if (currentView !== 'landing') {
          setCurrentView('landing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm, currentView, selectedEntry, isCmdOpen]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    let result = entries;

    if (searchTerm) {
      const fuseResult = fuse.search(searchTerm);
      result = fuseResult.map(r => r.item);
    }

    if (selectedCategory !== 'All') {
      result = result.filter(entry => entry.category === selectedCategory);
    }

    if (selectedYear) {
      result = result.filter(entry => entry.year === selectedYear);
    }

    if (selectedSeverity) {
      result = result.filter(entry => entry.severity.level === selectedSeverity);
    }

    return result;
  }, [entries, searchTerm, selectedCategory, selectedYear, selectedSeverity, fuse]);

  const handleFilterIncidents = (filters: { category?: Category; year?: number; severity?: string }) => {
    if (filters.category) setSelectedCategory(filters.category);
    if (filters.year) {
      setSelectedYear(filters.year);
    } else {
      setSelectedYear(null);
    }
    if (filters.severity) {
      setSelectedSeverity(filters.severity);
    } else {
      setSelectedSeverity(null);
    }
    setCurrentView('feed');
  };

  const handleCategoryJump = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedYear(null);
    setSelectedSeverity(null);
    setCurrentView('feed');
  };

  const counts = useMemo(() => {
    const tempCounts: Record<string, number> = { 'All': entries.length };
    CATEGORIES.forEach(cat => {
      if (cat !== 'All') tempCounts[cat] = 0;
    });
    entries.forEach(e => {
      if (tempCounts[e.category] !== undefined) {
        tempCounts[e.category]++;
      }
    });
    return tempCounts;
  }, [entries]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentView} entries={entries} onSelectEntry={setSelectedEntry} onFilterIncidents={handleFilterIncidents} />;
      case 'calculator':
        return <SeverityCalculator />;
      case 'wizard':
        return <TroubleshootingWizard />;
      case 'checklist':
        return <AgentChecklist />;
      case 'dev-portal':
        return <DeveloperPortal />;
      case 'analytics':
        return <StatsDashboard entries={entries} />;
      case 'generator':
        return <PostMortemGenerator />;
      case 'search':
        return <SimilaritySearch entries={entries} onSelectEntry={setSelectedEntry} />;
      case 'patterns':
        return (
          <PatternsView
            onNavigateToFailure={(id) => {
              const entry = entries.find(e => e.id === id);
              if (entry) setSelectedEntry(entry);
            }}
          />
        );
      case 'feed':
      default:
        return (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 animate-in fade-in duration-300 gap-4">
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight">
                  {selectedCategory === 'All' ? 'INDEX_FEED' : selectedCategory.toUpperCase().replace(' ', '_')}
                </h2>
                <span className="hidden sm:inline text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                  REQ_ID: {reqId}
                </span>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                      <span>TOTAL: {entries.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span>FILTERED: {filteredEntries.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>CATEGORY: {selectedCategory}</span>
                    </div>
                  </div>
                </div>

                <div className="flex bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-0.5 rounded-lg">
                  <button
                    onClick={() => setFeedMode('list')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${feedMode === 'list'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow'
                      : 'text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    List
                  </button>
                  <button
                    onClick={() => setFeedMode('timeline')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${feedMode === 'timeline'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow'
                      : 'text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Timeline
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : filteredEntries.length > 0 ? (
              feedMode === 'timeline' ? (
                <TimelineView entries={filteredEntries} onSelect={setSelectedEntry} />
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                  {filteredEntries.map((entry) => (
                    <FailureCard key={entry.id} entry={entry} onClick={setSelectedEntry} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/10">
                <p className="text-zinc-600 dark:text-zinc-400 text-lg font-light">No failures found matching parameters.</p>
                <div className="flex flex-col items-center gap-2 mt-4">
                  {(selectedYear || selectedSeverity) && (
                    <div className="flex gap-2 text-[10px] font-mono mb-2">
                      {selectedYear && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded">YEAR: {selectedYear}</span>}
                      {selectedSeverity && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded">SEVERITY: {selectedSeverity.toUpperCase()}</span>}
                    </div>
                  )}
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedYear(null); setSelectedSeverity(null); }}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-xs font-mono uppercase tracking-widest border-b border-blue-500/30 hover:border-blue-500 pb-1"
                  >
                    [ Clear Filters ]
                  </button>
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500/30">
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        entries={entries}
        onNavigate={setCurrentView}
        onToggleTheme={toggleTheme}
        onSelectEntry={setSelectedEntry}
        onCategoryJump={handleCategoryJump}
      />

      {selectedEntry && (
        <IncidentModal
          entry={selectedEntry}
          allEntries={entries}
          onClose={() => setSelectedEntry(null)}
          onSelectEntry={setSelectedEntry}
        />
      )}

      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-white/5 bg-white/70 dark:bg-black/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentView('landing')}>
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-red-500 dark:bg-red-600 rounded blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-black border border-zinc-300 dark:border-zinc-700 rounded flex items-center justify-center shadow-inner group-hover:border-red-500/50 transition-colors">
                <span className="font-mono font-bold text-red-600 dark:text-red-500 text-lg group-hover:text-red-500 dark:group-hover:text-red-400">!</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-wider text-zinc-900 dark:text-white uppercase">
                Failure Registry
              </h1>
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono tracking-widest group-hover:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors">{version}</span>
            </div>
          </div>

          <div className="flex-1 max-w-lg mx-4 sm:mx-8 flex justify-end sm:justify-center">
            <div className="relative group cursor-text hidden sm:block w-full" onClick={() => setIsCmdOpen(true)}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition duration-500"></div>

              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="block w-full pl-10 pr-12 py-2 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg sm:text-sm font-mono transition-all truncate">
                  Search or Type Command...
                </div>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <kbd className="inline-flex items-center border border-zinc-300 dark:border-zinc-700 rounded px-2 text-[10px] font-sans font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800/50">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Mobile Compact Command Icon */}
            <button
              onClick={() => setIsCmdOpen(true)}
              className="sm:hidden p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 border-l border-zinc-200 dark:border-zinc-800 pl-6">
            <button
              onClick={toggleTheme}
              className="p-3 sm:p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              title="Toggle Laboratory/Dark Mode"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            <a
              href="https://github.com/rnzor/awesome-tech-failures"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <span className="hidden sm:block text-xs font-medium group-hover:underline decoration-zinc-400 dark:decoration-zinc-700 underline-offset-4">GitHub</span>
              <svg height="20" viewBox="0 0 16 16" width="20" className="fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col relative z-10">
        <div className="flex flex-col md:flex-row gap-8 flex-1">
          <Sidebar
            currentView={currentView}
            onChangeView={setCurrentView}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={counts}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1">
              {renderContent()}
            </div>
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;