import React, { useMemo, useState } from 'react';
import { FailureEntry } from '../types';

interface Props {
    entries: FailureEntry[];
}

export const IncidentHeatmap: React.FC<Props> = ({ entries }) => {
    const [hoveredCell, setHoveredCell] = useState<{ label: string, count: number, score: number, topSeverity: string } | null>(null);

    const CATEGORIES = [
        { id: 'ai-slop', label: 'AI' },
        { id: 'outage', label: 'OUT' },
        { id: 'security', label: 'SEC' },
        { id: 'startup', label: 'SRT' },
        { id: 'product', label: 'PRD' },
        { id: 'decision', label: 'DEC' },
    ];

    // Get unique years, limit to last 8 years max for fit
    const YEARS = useMemo(() => {
        const allYears = Array.from(new Set(entries.map(e => e.year))).sort((a, b) => a - b);
        return allYears.slice(-8); // Keep last 8 years max
    }, [entries]);

    const gridData = useMemo(() => {
        const data: any[] = [];
        YEARS.forEach(year => {
            CATEGORIES.forEach(cat => {
                const matches = entries.filter(e => e.year === year && e.category === cat.id);
                let score = 0;
                let topSeverity = '';

                if (matches.length > 0) {
                    if (matches.some(e => e.severity?.level === 'critical')) {
                        score = 4;
                        topSeverity = 'Critical';
                    } else if (matches.some(e => e.severity?.level === 'high')) {
                        score = 3;
                        topSeverity = 'High';
                    } else if (matches.some(e => e.severity?.level === 'medium')) {
                        score = 2;
                        topSeverity = 'Medium';
                    } else {
                        score = 1;
                        topSeverity = 'Low';
                    }
                }

                data.push({
                    year,
                    category: cat.id,
                    count: matches.length,
                    score,
                    topSeverity,
                    label: `${year} // ${cat.label}`
                });
            });
        });
        return data;
    }, [entries, YEARS]);

    const getColor = (score: number) => {
        switch (score) {
            case 4: return 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]';
            case 3: return 'bg-orange-500';
            case 2: return 'bg-yellow-500';
            case 1: return 'bg-blue-500';
            default: return 'bg-zinc-200 dark:bg-zinc-800/60';
        }
    };

    if (YEARS.length === 0) {
        return (
            <div className="w-full p-6 text-center text-zinc-500 text-sm font-mono">
                Loading incident data...
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-zinc-500">
                    Temporal_Incident_Map
                </span>
                <div className="flex items-center gap-1.5 text-[8px] font-mono text-zinc-500">
                    <div className="w-2 h-2 bg-zinc-300 dark:bg-zinc-700 rounded-sm"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-sm"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-sm shadow-[0_0_3px_red]"></div>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1">
                {/* Y-Axis Labels (Categories) */}
                <div className="flex flex-col gap-1 justify-center">
                    {CATEGORIES.map(cat => (
                        <div
                            key={cat.id}
                            className="h-5 flex items-center justify-end pr-2"
                        >
                            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase">
                                {cat.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Grid Cells */}
                <div className="flex-1 flex gap-1">
                    {YEARS.map((year) => (
                        <div key={year} className="flex-1 flex flex-col gap-1">
                            {CATEGORIES.map(cat => {
                                const cell = gridData.find(d => d.year === year && d.category === cat.id)!;
                                return (
                                    <div
                                        key={`${year}-${cat.id}`}
                                        onMouseEnter={() => setHoveredCell(cell.count > 0 ? cell : null)}
                                        onMouseLeave={() => setHoveredCell(null)}
                                        className={`h-5 rounded transition-all duration-200 ${getColor(cell.score)} cursor-default hover:scale-110 hover:z-10`}
                                    />
                                );
                            })}
                            {/* Year label */}
                            <div className="h-4 flex items-center justify-center mt-1">
                                <span className="text-[8px] font-mono font-bold text-zinc-400">
                                    {String(year).slice(-2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hover Info */}
            <div className="h-8 mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800/50 text-[10px] font-mono text-zinc-500 flex items-center">
                {hoveredCell ? (
                    <div className="flex items-center gap-3 animate-in fade-in duration-200">
                        <span className="text-zinc-900 dark:text-white font-black">{hoveredCell.label}</span>
                        <span className="text-zinc-400">•</span>
                        <span>{hoveredCell.count} incident{hoveredCell.count !== 1 ? 's' : ''}</span>
                        <span className="text-zinc-400">•</span>
                        <span className={hoveredCell.score === 4 ? 'text-red-500 font-bold' : hoveredCell.score === 3 ? 'text-orange-500 font-bold' : 'text-zinc-500'}>
                            {hoveredCell.topSeverity}
                        </span>
                    </div>
                ) : (
                    <span className="text-zinc-400 opacity-50 uppercase tracking-wider text-[9px]">
                        Hover for details
                    </span>
                )}
            </div>
        </div>
    );
};