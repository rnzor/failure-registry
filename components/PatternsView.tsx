import React, { useEffect, useState } from 'react';
import { getPatterns } from '../services/apiService';
import { ApiPattern, ApiFailure } from '../types/api';
import { Badge } from './Badge';

interface Props {
    onSelectPattern?: (pattern: ApiPattern) => void;
    onNavigateToFailure: (id: string) => void;
}

export const PatternsView: React.FC<Props> = ({ onNavigateToFailure }) => {
    const [patterns, setPatterns] = useState<ApiPattern[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPattern, setSelectedPattern] = useState<ApiPattern | null>(null);

    useEffect(() => {
        const fetchPatterns = async () => {
            try {
                setLoading(true);
                const data = await getPatterns();
                setPatterns(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load patterns');
            } finally {
                setLoading(false);
            }
        };
        fetchPatterns();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Hydrating Patterns...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <p className="text-red-400 font-mono text-sm uppercase">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-2 uppercase">Failure_Patterns</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono italic">
                    High-level abstractions of recurring anti-patterns found across the failure index.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {patterns.map((pattern) => (
                    <div
                        key={pattern.id}
                        onClick={() => setSelectedPattern(pattern)}
                        className={`flex flex-col p-6 rounded-xl border transition-all cursor-pointer group ${selectedPattern?.id === pattern.id
                                ? 'bg-blue-500/5 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Pattern_ID: {pattern.id}</span>
                            </div>
                            {pattern.playbooks && pattern.playbooks.length > 0 && (
                                <Badge type="tag" className="bg-purple-500/10 text-purple-400 border-purple-500/20 uppercase text-[9px]">Playbook Available</Badge>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">{pattern.title}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 italic">
                            "{pattern.description}"
                        </p>

                        <div className="mt-auto space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {pattern.related_categories.map(cat => (
                                    <span key={cat} className="text-[10px] font-mono font-bold uppercase py-0.5 px-1.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-500">{cat}</span>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase">{pattern.examples.length} Verified Examples</span>
                                <svg className={`w-4 h-4 transition-transform ${selectedPattern?.id === pattern.id ? 'rotate-90 text-blue-500' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedPattern && (
                <div className="mt-12 p-8 bg-zinc-900/10 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-in slide-in-from-top-4 duration-500">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-6">Verified_Incidents_for_{selectedPattern.id.toUpperCase()}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedPattern.examples.map((exampleId) => (
                            <div
                                key={exampleId}
                                onClick={() => onNavigateToFailure(exampleId)}
                                className="p-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-blue-500/50 cursor-pointer group transition-all"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{exampleId}</span>
                                    <svg className="w-3 h-3 text-zinc-700 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </div>
                                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-200 group-hover:text-white truncate">
                                    {exampleId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
