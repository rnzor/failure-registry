import React, { useMemo, useState } from 'react';
import { FailureEntry } from '../types';

interface Props {
    entries: FailureEntry[];
}

export const IncidentHeatmap: React.FC<Props> = ({ entries }) => {
    const [hoveredCell, setHoveredCell] = useState<{ label: string, count: number, score: number, topSeverity: string } | null>(null);

    // Since we only have 'year', let's pivot to a Category vs Year grid
    const CATEGORIES = ['ai-slop', 'outage', 'security', 'startup', 'product', 'decision'];
    const YEARS = Array.from(new Set(entries.map(e => e.year))).sort((a, b) => a - b);

    const gridData = useMemo(() => {
        const data: any[] = [];
        YEARS.forEach(year => {
            CATEGORIES.forEach(cat => {
                const matches = entries.filter(e => e.year === year && e.category === cat);
                let score = 0;
                let topSeverity = '';

                if (matches.length > 0) {
                    if (matches.some(e => e.severity.level === 'critical')) {
                        score = 4;
                        topSeverity = 'Critical';
                    } else if (matches.some(e => e.severity.level === 'high')) {
                        score = 3;
                        topSeverity = 'High';
                    } else if (matches.some(e => e.severity.level === 'medium')) {
                        score = 2;
                        topSeverity = 'Medium';
                    } else {
                        score = 1;
                        topSeverity = 'Low';
                    }
                }

                data.push({
                    year,
                    category: cat,
                    count: matches.length,
                    score,
                    topSeverity,
                    label: `${year} // ${cat.toUpperCase()}`
                });
            });
        });
        return data;
    }, [entries, YEARS, CATEGORIES]);

    const getColor = (score: number) => {
        switch (score) {
            case 4: return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
            case 3: return 'bg-orange-500';
            case 2: return 'bg-yellow-500';
            case 1: return 'bg-blue-500';
            default: return 'bg-zinc-100 dark:bg-zinc-800/40';
        }
    };

    return (
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex flex-col gap-4 min-w-[700px]">
                <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500">Categorical_Failure_Density_Map</span>
                    <div className="flex items-center gap-3 text-[9px] text-zinc-600 font-mono">
                        <span className="opacity-50 tracking-widest">MIN</span>
                        <div className="w-2.5 h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-blue-500/50 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-sm shadow-[0_0_4px_red]"></div>
                        <span className="opacity-50 tracking-widest">MAX</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col gap-1.5 pr-4 justify-between py-1">
                        {CATEGORIES.map(cat => (
                            <span key={cat} className="text-[9px] font-mono font-bold text-zinc-500 uppercase text-right h-4 flex items-center">{cat}</span>
                        ))}
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto">
                        {YEARS.map((year) => (
                            <div key={year} className="flex flex-col gap-1.5 items-center">
                                {CATEGORIES.map(cat => {
                                    const cell = gridData.find(d => d.year === year && d.category === cat)!;
                                    return (
                                        <div
                                            key={`${year}-${cat}`}
                                            onMouseEnter={() => setHoveredCell(cell.count > 0 ? cell : null)}
                                            onMouseLeave={() => setHoveredCell(null)}
                                            className={`w-4 h-4 rounded-md transition-all duration-300 ${getColor(cell.score)} cursor-default hover:scale-110 hover:z-10`}
                                        ></div>
                                    );
                                })}
                                <span className="mt-2 text-[9px] font-mono font-black text-zinc-400 rotate-45 origin-left tracking-tighter">{year}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-10 mt-6 border-t border-zinc-200 dark:border-zinc-800/50 pt-4 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                    {hoveredCell ? (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-zinc-900 dark:text-white font-black">{hoveredCell.label}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                            <span>{hoveredCell.count} INCIDENTS</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                            <span className="uppercase flex items-center gap-2">
                                Max_Severity:
                                <span className={hoveredCell.score === 4 ? 'text-red-500 font-black' : 'text-blue-500 font-black'}>
                                    {hoveredCell.topSeverity}
                                </span>
                            </span>
                        </div>
                    ) : (
                        <span className="text-zinc-400 dark:text-zinc-700 opacity-50 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-3 bg-zinc-700 animate-pulse"></span>
                            Neural_Map_Ready: Hover cells for detailed entropy telemetry...
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};