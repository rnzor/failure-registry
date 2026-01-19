import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
  type?: 'category' | 'severity' | 'tag';
  value?: string;
}

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'ai-slop': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    case 'outage': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'security': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    case 'startup': return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    case 'product': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'decision': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    default: return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
  }
};

const getSeverityColor = (sev: string) => {
  switch (sev) {
    case 'critical': return 'text-red-600 dark:text-red-500 border-red-500/50 bg-red-500/10 font-bold';
    case 'high': return 'text-orange-600 dark:text-orange-500 border-orange-500/50 bg-orange-500/10';
    case 'medium': return 'text-yellow-600 dark:text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
    case 'low': return 'text-blue-600 dark:text-blue-500 border-blue-500/50 bg-blue-500/10';
    default: return 'text-zinc-500 border-zinc-500/50 bg-zinc-500/10';
  }
};

export const Badge: React.FC<BadgeProps> = ({ children, className = '', type, value }) => {
  let colorClass = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';

  if (type === 'category' && value) {
    colorClass = getCategoryColor(value);
  } else if (type === 'severity' && value) {
    colorClass = getSeverityColor(value);
  } else if (type === 'tag') {
    colorClass = 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/50 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors';
  }

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-widest ${colorClass} ${className}`}>
      {children}
    </span>
  );
};