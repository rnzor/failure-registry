import React, { useState } from 'react';

const SEVERITY_LEVELS = [
    { level: 'CRITICAL', title: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500', desc: 'Maximum blast radius. Irreversible data loss or total service blackout for all users.' },
    { level: 'HIGH', title: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500', desc: 'Significant impairment. Major features unavailable or region-wide localized blackout.' },
    { level: 'MEDIUM', title: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500', desc: 'Partial degradation. Degraded performance or minor feature failure with workarounds.' },
    { level: 'LOW', title: 'Low', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500', desc: 'Cosmetic or internal impact. No immediate effect on production customer experience.' },
];

const MATRIX = [
    // Scope 1 (Single) -> Scope 4 (Global)
    // Impact 1 (Cosmetic)
    ['LOW', 'LOW', 'MEDIUM', 'MEDIUM'],
    // Impact 2 (Minor)
    ['LOW', 'MEDIUM', 'MEDIUM', 'HIGH'],
    // Impact 3 (Major)
    ['MEDIUM', 'HIGH', 'HIGH', 'CRITICAL'],
    // Impact 4 (Data Loss)
    ['HIGH', 'CRITICAL', 'CRITICAL', 'CRITICAL']
];

const CyberSlider: React.FC<{
    label: string;
    value: number;
    max: number;
    onChange: (val: number) => void;
    labels: string[];
}> = ({ label, value, max, onChange, labels }) => {
    const percentage = ((value - 1) / (max - 1)) * 100;

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-sm">
            <div className="flex justify-between items-end mb-6 relative z-10">
                <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
                <span className="text-xl font-mono font-black text-blue-600 dark:text-blue-500">LVL_{value}</span>
            </div>

            <div className="relative h-8 flex items-center mb-6 z-10">
                <div className="absolute left-0 right-0 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(59,130,246,0.3)]" style={{ width: `${percentage}%` }}></div>
                </div>

                <input
                    type="range" min="1" max={max} step="1"
                    value={value} onChange={(e) => onChange(parseInt(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                />

                <div
                    className="absolute h-6 w-6 bg-white dark:bg-zinc-950 border-2 border-blue-500 rounded-full shadow-lg pointer-events-none transition-all duration-300 ease-out flex items-center justify-center z-10"
                    style={{ left: `calc(${percentage}% - 12px)` }}
                >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center relative z-10">
                {labels.map((l, i) => {
                    const isActive = (i + 1) === value;
                    return (
                        <div
                            key={i}
                            onClick={() => onChange(i + 1)}
                            className={`text-[9px] uppercase font-mono tracking-widest cursor-pointer transition-colors duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        >
                            {l}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const RiskMatrix: React.FC<{ impact: number, scope: number }> = ({ impact, scope }) => {
    return (
        <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl relative overflow-hidden backdrop-blur-md shadow-inner">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 text-center">Protocol_Risk_Matrix</h4>
            <div className="grid grid-cols-5 gap-2">
                <div className="col-span-1 flex flex-col justify-between py-2 text-[9px] font-mono text-zinc-400 text-right pr-3">
                    <span className="h-10 flex items-center justify-end">DATA LOSS</span>
                    <span className="h-10 flex items-center justify-end">MAJOR</span>
                    <span className="h-10 flex items-center justify-end">MINOR</span>
                    <span className="h-10 flex items-center justify-end">COSMETIC</span>
                </div>

                <div className="col-span-4 grid grid-cols-4 grid-rows-4 gap-2">
                    {[3, 2, 1, 0].map((impIdx) => (
                        <React.Fragment key={impIdx}>
                            {[0, 1, 2, 3].map((scoIdx) => {
                                const sevCode = MATRIX[impIdx][scoIdx];
                                const isSelected = (impact - 1) === impIdx && (scope - 1) === scoIdx;

                                let color = 'bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800';
                                if (sevCode === 'CRITICAL') color = 'bg-red-500/10 text-red-500 border-red-500/20';
                                if (sevCode === 'HIGH') color = 'bg-orange-500/10 text-orange-500 border-orange-500/20';
                                if (sevCode === 'MEDIUM') color = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                                if (sevCode === 'LOW') color = 'bg-blue-500/10 text-blue-500 border-blue-500/20';

                                return (
                                    <div
                                        key={`${impIdx}-${scoIdx}`}
                                        className={`
                                            h-10 flex items-center justify-center text-[8px] font-mono font-black rounded-lg transition-all duration-300
                                            ${isSelected ? 'ring-2 ring-blue-500 scale-105 z-10 shadow-2xl ' + color.replace('/10', '/40') + ' !text-white !bg-blue-600' : color}
                                            ${!isSelected && 'opacity-40'}
                                        `}
                                    >
                                        {sevCode}
                                    </div>
                                )
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="flex justify-between pl-[20%] pt-4 text-[9px] font-mono text-zinc-400 text-center tracking-widest">
                <span className="flex-1">SINGLE</span>
                <span className="flex-1">TEAM</span>
                <span className="flex-1">REGION</span>
                <span className="flex-1">GLOBAL</span>
            </div>
            <div className="text-center text-[9px] font-black uppercase text-zinc-400 mt-4 tracking-[0.3em]">User_Scope_Axis →</div>
        </div>
    );
};

export const SeverityCalculator: React.FC = () => {
    const [impact, setImpact] = useState(1);
    const [scope, setScope] = useState(1);

    const calculateSeverity = () => {
        const sevCode = MATRIX[impact - 1][scope - 1];
        return SEVERITY_LEVELS.find(s => s.level === sevCode) || SEVERITY_LEVELS[3];
    };

    const result = calculateSeverity();

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-4xl font-black text-zinc-900 dark:text-white mb-2 tracking-tighter uppercase">Severity_Calc_9000</h2>
                <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">Standardized risk assessment protocol based on the core failure index schema.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-5 space-y-6">
                    <CyberSlider
                        label="System_Impact"
                        value={impact}
                        max={4}
                        onChange={setImpact}
                        labels={['Cosmetic', 'Minor', 'Major', 'Data Loss']}
                    />
                    <CyberSlider
                        label="Blast_Radius"
                        value={scope}
                        max={4}
                        onChange={setScope}
                        labels={['Single', 'Team', 'Region', 'Global']}
                    />

                    <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl text-[10px] font-mono text-blue-600 dark:text-blue-400 leading-relaxed shadow-inner">
                        <div className="flex items-start gap-3">
                            <svg className="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p>PROTOCOL_NOTE: Workaround availability and business criticality multi-factors are computed into the raw impact score. Data Loss override triggers immediate CRITICAL clearance.</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-8">
                    <RiskMatrix impact={impact} scope={scope} />

                    <div className={`relative p-8 rounded-3xl border-2 ${result.bg} ${result.border} shadow-2xl transition-all duration-500 overflow-hidden flex-1 flex flex-col justify-center backdrop-blur-sm`}>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className={`text-6xl md:text-7xl font-black ${result.color} tracking-tighter uppercase`}>{result.level}</h3>
                                <div className={`w-12 h-12 rounded-full border-2 border-current flex items-center justify-center ${result.color} animate-pulse`}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                            </div>

                            <div className="bg-black/10 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/10 mb-6">
                                <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">Protocol_Description</label>
                                <p className="text-zinc-900 dark:text-zinc-100 text-base font-medium leading-relaxed italic">"{result.desc}"</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/40 dark:bg-black/40 p-4 rounded-xl border border-white/20 dark:border-black/20">
                                    <span className="block text-zinc-500 dark:text-zinc-400 text-[9px] font-mono font-bold uppercase tracking-widest mb-1">Response_SLA</span>
                                    <span className="font-mono text-zinc-900 dark:text-white font-black text-sm">{result.level === 'CRITICAL' ? 'T-15m' : result.level === 'HIGH' ? 'T-1h' : 'T-24h'}</span>
                                </div>
                                <div className="bg-white/40 dark:bg-black/40 p-4 rounded-xl border border-white/20 dark:border-black/20">
                                    <span className="block text-zinc-500 dark:text-zinc-400 text-[9px] font-mono font-bold uppercase tracking-widest mb-1">Alert_Channel</span>
                                    <span className="font-mono text-zinc-900 dark:text-white font-black text-sm">{result.level === 'CRITICAL' ? '#SEV-0-GLOBAL' : '#INCIDENT-ACTIVE'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};