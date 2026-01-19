import React, { useState, useMemo, useEffect } from 'react';
import { API_SPEC_MOCK, RAG_GUIDE_CODE, CLIENT_SEARCH_IMPL } from '../services/devResources';
import { FailureEntry } from '../types';
import { loadFailures } from '../services/dataService';
import { searchSimilarity, loadEmbeddings } from '../services/similarityService';
import { SimilarityResult } from '../types/api';

export const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api' | 'rag' | 'explorer'>('api');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SimilarityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Note: This uses hybrid lookup only for the explorer
        const results = await searchSimilarity(searchQuery, 3, undefined, true);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-zinc-900 dark:text-white mb-2 tracking-tighter uppercase">Developer_Gateway</h2>
          <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">High-fidelity resources for agentic RAG pipelines and system integrations.</p>
        </div>
        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">API_STATUS: OPERATIONAL_V1</span>
        </div>
      </div>

      <div className="flex space-x-1 bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-10 inline-flex shadow-inner">
        {[
          { id: 'api', label: 'API_SPEC' },
          { id: 'rag', label: 'RAG_PROTO' },
          { id: 'explorer', label: 'CONTEXT_TEST' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-lg text-xs font-black transition-all uppercase tracking-widest ${activeTab === tab.id ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'api' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-8 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{API_SPEC_MOCK.info.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-mono font-bold">V{API_SPEC_MOCK.info.version}</span>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">OpenAPI Specification 3.0.0</p>
                </div>
              </div>
              <div className="text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700">
                ENDPOINT_ROOT: {API_SPEC_MOCK.servers[0].url}
              </div>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {API_SPEC_MOCK.paths.map((endpoint, idx) => (
                <div key={idx} className="p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors">
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${endpoint.method === 'GET' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                        endpoint.method === 'CLIENT' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' :
                          'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                      }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-zinc-900 dark:text-blue-400 font-mono text-sm font-bold bg-zinc-100 dark:bg-black/40 px-3 py-1 rounded-lg">{endpoint.path}</code>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6 font-medium italic">"{endpoint.description}"</p>

                  {endpoint.params.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">Input_Parameters</h4>
                      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <table className="w-full text-left text-xs bg-zinc-50 dark:bg-black/20">
                          <thead>
                            <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                              <th className="p-3 font-black text-zinc-500 uppercase">Parameter</th>
                              <th className="p-3 font-black text-zinc-500 uppercase">In</th>
                              <th className="p-3 font-black text-zinc-500 uppercase">Type</th>
                              <th className="p-3 font-black text-zinc-500 uppercase">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {endpoint.params.map((param, pIdx) => (
                              <tr key={pIdx} className="hover:bg-zinc-100/50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-3 font-mono text-zinc-900 dark:text-zinc-300 font-black">{param.name}{param.required && <span className="text-red-500 ml-1">*</span>}</td>
                                <td className="p-3 text-zinc-500 font-mono">{param.in.toUpperCase()}</td>
                                <td className="p-3 text-blue-600 dark:text-blue-400 font-mono italic">{param.type}</td>
                                <td className="p-3 text-zinc-600 dark:text-zinc-300">{param.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {(endpoint as any).implementation && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em]">Execution_Reference</h4>
                        <button onClick={() => handleCopy(CLIENT_SEARCH_IMPL)} className="text-[9px] font-mono text-blue-500 uppercase hover:underline">Copy_Impl</button>
                      </div>
                      <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-zinc-800 overflow-x-auto text-[11px] font-mono leading-relaxed text-blue-100/90 shadow-inner group relative">
                        <div className="absolute top-2 right-4 text-[9px] text-zinc-700 tracking-widest uppercase">JavaScript_SDK</div>
                        <pre>{CLIENT_SEARCH_IMPL}</pre>
                      </div>
                    </div>
                  )}

                  {endpoint.body && (
                    <div className="mt-6 bg-zinc-50 dark:bg-black/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3">Sample_Request_Body</h4>
                      <pre className="text-xs text-zinc-600 dark:text-zinc-400 font-mono whitespace-pre-wrap">{JSON.stringify(endpoint.body, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rag' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">VEC_ENGINE_ORCHESTRATION</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 font-mono italic">
                  Protocols for injecting High-Entropy failure context into transformer-based agents.
                </p>
              </div>
              <button
                onClick={() => handleCopy(RAG_GUIDE_CODE)}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 shadow-lg"
              >
                {copied ? 'SNIPPET_COPIED' : 'COPY_INTEGRATION_PROTO'}
              </button>
            </div>

            <div className="relative group">
              <div className="absolute top-4 right-6 text-[10px] text-zinc-700 font-mono tracking-widest uppercase flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                PYTHON_RAG_V1
              </div>
              <pre className="bg-[#0a0a0a] p-8 rounded-2xl border border-zinc-800 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-blue-100 shadow-2xl">
                <code>{RAG_GUIDE_CODE}</code>
              </pre>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-zinc-50 dark:bg-black/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
                <h4 className="font-black text-zinc-900 dark:text-white text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  VECTOR_SCHEMA
                </h4>
                <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2 font-mono">
                  <li className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1"><span>ID:</span> <span className="text-zinc-900 dark:text-zinc-200 font-black">UUIDv4</span></li>
                  <li className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1"><span>MODEL:</span> <span className="text-blue-500">text-embedding-3-small</span></li>
                  <li className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1"><span>DIMENSIONS:</span> <span className="text-zinc-900 dark:text-zinc-200">1536 (Normalized)</span></li>
                  <li className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1"><span>METADATA:</span> <span className="text-zinc-900 dark:text-zinc-200">year, category, severity, tags</span></li>
                </ul>
              </div>
              <div className="p-6 bg-zinc-50 dark:bg-black/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
                <h4 className="font-black text-zinc-900 dark:text-white text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  RETRIVAL_STRATEGY
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                  Contextual injection utilizes <code>summary</code> and <code>impact</code> as primary embedding keys. For agentic planning, the <code>patterns</code> field is provided as high-level semantic anchors to avoid recursive reasoning loops.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'explorer' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mb-8">
            <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">Context_Retrieval_Simulator</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 ${isSearching ? 'text-blue-500 animate-spin' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="PROMPT: Simulate agent context query (e.g., 'cascading failure in dns')"
                className="block w-full pl-12 pr-4 py-5 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-sm shadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
                <span className="text-[9px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded uppercase tracking-tighter shadow-sm">Semantic_Rank_v1</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {searchResults.length > 0 ? (
              searchResults.map((result, idx) => (
                <div key={result.id} className="bg-[#0a0a0a] rounded-3xl border border-zinc-800 p-8 font-mono text-xs overflow-x-auto relative group shadow-2xl hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-600 font-black">[{idx + 1}]</span>
                      <div className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded uppercase text-[9px] font-black tracking-widest leading-none">
                        Similarity_Match: {result.similarity_score.toFixed(6)}
                      </div>
                    </div>
                    <span className="text-[9px] text-zinc-700 tracking-[0.2em] font-black uppercase">Source_Corpus_Ref::{result.id}</span>
                  </div>
                  <pre className="text-zinc-400 leading-relaxed">
                    {JSON.stringify({
                      id: result.id,
                      category: result.category,
                      severity: result.severity,
                      tags: result.tags,
                      vector_snippet: result.vector.slice(0, 4).map(v => v.toFixed(8)) + ' ...'
                    }, null, 2)}
                  </pre>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50 dark:bg-zinc-900/10">
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-full shadow-lg mb-4 text-zinc-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] font-bold">Awaiting_Neural_Input</p>
                <p className="text-zinc-400 text-[10px] mt-2 italic font-mono uppercase tracking-tighter opacity-50">Enter a query above to simulate semantic retrieval...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};