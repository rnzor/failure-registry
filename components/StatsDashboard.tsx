import React, { useMemo } from 'react';
import { FailureEntry, Category } from '../types';

interface Props {
    entries: FailureEntry[];
}

const CATEGORIES: Category[] = ['ai-slop', 'outage', 'security', 'startup', 'product', 'decision'];

const formatCategoryName = (cat: string): string => {
    const formatMap: Record<string, string> = {
        'ai-slop': 'AI Slop',
        'outage': 'Outage',
        'security': 'Security',
        'startup': 'Startup',
        'product': 'Product',
        'decision': 'Decision'
    };
    return formatMap[cat] || cat;
};

export const StatsDashboard: React.FC<Props> = ({ entries }) => {

    const severityDist = useMemo(() => {
        const counts: Record<string, number> = { 'critical': 0, 'high': 0, 'medium': 0, 'low': 0 };
        entries.forEach(e => {
            const level = e.severity.level;
            counts[level] = (counts[level] || 0) + 1;
        });
        return Object.entries(counts).map(([k, v]) => ({ label: k, value: v, percent: entries.length > 0 ? (v / entries.length) * 100 : 0 }));
    }, [entries]);

    const categoryDist = useMemo(() => {
        const counts: Record<string, number> = {};
        CATEGORIES.forEach(c => counts[c] = 0);
        entries.forEach(e => {
            if (counts[e.category] !== undefined) {
                counts[e.category]++;
            }
        });
        return Object.entries(counts).map(([k, v]) => ({ label: k as Category, value: v, percent: entries.length > 0 ? (v / entries.length) * 100 : 0 })).sort((a, b) => b.value - a.value);
    }, [entries]);

    const yearsDist = useMemo(() => {
        const counts: Record<string, number> = {};
        entries.forEach(e => {
            const y = e.year.toString();
            counts[y] = (counts[y] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    }, [entries]);

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'critical': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-blue-500';
            default: return 'bg-zinc-500';
        }
    };

    const getSeverityTextColor = (sev: string) => {
        switch (sev) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-orange-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-blue-500';
            default: return 'text-zinc-500';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight uppercase">Index_Analytics</h2>
                    <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">Statistical breakdown of the failure index corpus.</p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Total_Records</div>
                    <div className="text-4xl font-black text-zinc-900 dark:text-white font-mono">{entries.length}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Severity_Distribution</h3>
                    </div>

                    <div className="space-y-6">
                        {severityDist.map((item) => (
                            <div key={item.label} className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <span className={`text-xs font-mono font-bold uppercase ${getSeverityTextColor(item.label)}`}>{item.label}</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-zinc-900 dark:text-white font-mono font-bold text-sm">{item.value}</span>
                                        <span className="text-[10px] text-zinc-400 font-mono">({Math.round(item.percent)}%)</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${getSeverityColor(item.label)}`}
                                        style={{ width: `${Math.max(item.percent, 2)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Category_Frequency</h3>
                    </div>

                    <div className="space-y-5">
                        {categoryDist.map((item) => (
                            <div key={item.label} className="group relative">
                                <div className="flex justify-between items-center mb-1.5 z-10 relative">
                                    <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">{formatCategoryName(item.label).replace(' ', '_')}</span>
                                    <span className="text-[10px] font-mono text-zinc-400 group-hover:text-white transition-colors">{item.value}</span>
                                </div>

                                <div className="relative h-6 w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50 rounded flex items-center px-2 overflow-hidden">
                                    <div
                                        className="absolute left-0 top-0 bottom-0 bg-blue-500/10 dark:bg-blue-500/20 border-r border-blue-500/50 transition-all duration-1000 group-hover:bg-blue-500/30"
                                        style={{ width: `${Math.max(item.percent, 1)}%` }}
                                    ></div>
                                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-400 font-mono">
                                        {item.percent.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Incident_Volume_Chronology</h3>
                </div>

                <div className="flex items-end justify-between gap-4 h-48 w-full border-b border-zinc-200 dark:border-zinc-800/50 pb-0 pt-4">
                    {yearsDist.length > 0 ? yearsDist.map(([year, count]) => {
                        const max = Math.max(...yearsDist.map(y => y[1]));
                        const height = (count / max) * 100;

                        return (
                            <div key={year} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded mb-2 font-mono whitespace-nowrap z-20 pointer-events-none">
                                    {count} INCIDENTS
                                </div>

                                <div
                                    className="w-full max-w-[50px] bg-zinc-200 dark:bg-zinc-800 rounded-t-sm hover:bg-blue-500/50 transition-colors relative"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-400 dark:bg-zinc-500 opacity-50"></div>
                                </div>

                                <div className="mt-4 text-[10px] font-mono font-bold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{year}</div>
                            </div>
                        );
                    }) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-xs">NO_CHRONO_DATA</div>
                    )}
                </div>
            </div>
        </div>
    );
};