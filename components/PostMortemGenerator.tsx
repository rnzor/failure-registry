import React, { useState } from 'react';

export const PostMortemGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    authors: '',
    status: 'Resolved',
    summary: '',
    impact: '',
    root_cause: '',
    patterns: '',
    resolution: '',
    lessons: ''
  });

  const [generated, setGenerated] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateReport = () => {
    const md = `
# Incident Post-Mortem: ${formData.title}

**Year:** ${formData.year}
**Authors:** ${formData.authors}
**Status:** ${formData.status}

## 1. Executive Summary
${formData.summary}

## 2. Impact
${formData.impact}

## 3. Root Cause
${formData.root_cause}

## 4. Failure Patterns Identified
${formData.patterns}

## 5. Resolution & Recovery
${formData.resolution}

## 6. Lessons Learned & Action Items
${formData.lessons}

---
*Generated via Awesome Tech Failures [REPORT_GEN_V1]*
    `.trim();
    setGenerated(md);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight uppercase">Report_Generator</h2>
          <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">Streamline the creation of standardized failure dossiers.</p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase mb-1.5">Incident_Title</label>
              <input name="title" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. Global DNS Propagation Delay" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase mb-1.5">Incident_Year</label>
              <input name="year" type="number" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-sm outline-none" defaultValue={new Date().getFullYear()} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase mb-1.5">Authors</label>
              <input name="authors" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-sm outline-none" placeholder="Team/Name" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase mb-1.5">Status</label>
              <select name="status" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-sm outline-none cursor-pointer" onChange={handleChange}>
                <option>Resolved</option>
                <option>Mitigated</option>
                <option>Legacy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase mb-1.5">Executive_Summary</label>
            <textarea name="summary" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-sm h-24 resize-none outline-none" placeholder="What happened at a high level?" onChange={handleChange}></textarea>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase mb-1.5">Root_Cause_Analysis</label>
            <textarea name="root_cause" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-sm h-24 resize-none outline-none" placeholder="Underlying technical or process failure..." onChange={handleChange}></textarea>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase mb-1.5">Identified_Patterns</label>
            <input name="patterns" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-sm outline-none" placeholder="e.g. cascaded-failure, spoj" onChange={handleChange} />
          </div>

          <button
            onClick={generateReport}
            className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-black rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Build Dossier
          </button>
        </div>
      </div>

      <div className="flex flex-col h-full bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-inner">
        <div className="bg-zinc-200 dark:bg-zinc-900 px-6 py-3 flex items-center justify-between border-b border-zinc-300 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Dossier_Preview
          </span>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
            <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
          </div>
        </div>

        <div className="flex-1 relative">
          <textarea
            className="w-full h-full bg-transparent border-none resize-none font-mono text-xs text-zinc-800 dark:text-zinc-300 focus:ring-0 p-8 leading-relaxed"
            value={generated}
            readOnly
            placeholder="The generated dossier markdown will appear here for review..."
          ></textarea>

          {generated && (
            <div className="absolute bottom-6 right-6">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generated);
                  // could add a toast here
                }}
                className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                title="Copy to Clipboard"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-3m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};