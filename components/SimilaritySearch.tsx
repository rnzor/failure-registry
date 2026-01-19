import React, { useState } from 'react';
import { searchSimilarity } from '../services/similarityService';
import { SimilarityResult } from '../types/api';
import { FailureEntry } from '../types';

interface ExtendedSimilarityResult extends SimilarityResult {
  entry: FailureEntry;
}

interface Props {
  entries: FailureEntry[];
  onSelectEntry: (entry: FailureEntry) => void;
}

export const SimilaritySearch: React.FC<Props> = ({ entries, onSelectEntry }) => {
  const [query, setQuery] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [results, setResults] = useState<ExtendedSimilarityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useHybridOnly, setUseHybridOnly] = useState(true);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchSimilarity(
        query,
        15,
        undefined,
        useHybridOnly,
        apiKey || undefined
      );

      const entriesWithScores = searchResults
        .map(result => {
          const entry = entries.find(e => e.id === result.id);
          if (!entry) return null;
          return { ...result, entry } as ExtendedSimilarityResult;
        })
        .filter((r): r is ExtendedSimilarityResult => r !== null);

      setResults(entriesWithScores);
      if (entriesWithScores.length === 0) {
        setError('No matches found for this query in the current index.');
      }
    } catch (err: any) {
      console.error('[SimilaritySearch] Error:', err);
      if (err.message?.includes('NO_EMBEDDING_AVAILABLE')) {
        setError('Term not in hybrid lookup. Enable API Key for custom queries.');
      } else {
        setError(err.message || 'Search failed. Please check your connection.');
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-blue-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-zinc-500';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight mb-2 flex items-center gap-3">
          <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          SEMANTIC_ENGINE v1
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono mb-6">
          Query the failure index using embeddings-based similarity. Finds contextually relevant incidents even if keywords don't match.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'Cloud database connectivity failure' or 'auth leak'"
              className="w-full pl-4 pr-12 py-4 bg-white dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between px-2">
            <label className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${useHybridOnly ? 'bg-blue-600 border-blue-500' : 'bg-transparent border-zinc-400'}`}>
                {useHybridOnly && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input
                type="checkbox"
                checked={useHybridOnly}
                onChange={(e) => setUseHybridOnly(e.target.checked)}
                className="sr-only"
              />
              <span className="group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">USE HYBRID LOOKUP ONLY (OFFLINE-FIRST)</span>
            </label>

            {!useHybridOnly && (
              <div className="flex-1 w-full max-w-xs animate-in slide-in-from-right-2 duration-300">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="OpenAI API Key (sk-...)"
                  className="w-full px-3 py-1.5 bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded text-[10px] font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-in shake duration-300">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-xs text-red-600 dark:text-red-400 font-mono uppercase tracking-widest">{error}</p>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
              Engine Results // k={results.length}
            </h3>
            <div className="h-px flex-1 mx-4 bg-zinc-200 dark:bg-zinc-800/50"></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => onSelectEntry(result.entry)}
                className="group relative p-4 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-blue-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-all overflow-hidden"
              >
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono font-black ${getSimilarityColor(result.similarity_score)} bg-current/5 px-1.5 py-0.5 rounded border border-current/20`}>
                        SIM: {(result.similarity_score * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">ID_{result.id.toUpperCase()}</span>
                    </div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate">
                      {result.entry.title}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1 italic">
                      "{result.entry.summary}"
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-[10px] text-zinc-500 font-mono">{result.entry.year}</span>
                    <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
