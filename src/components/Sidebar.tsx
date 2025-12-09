import React, { useMemo, useState } from 'react';
import { ChevronRight, FlaskConical, Search, Database } from 'lucide-react';
import { clsx } from 'clsx';
import indexData from '../data/experiments_index.json';
import type { ExperimentIndexItem } from '../App';

interface SidebarProps {
    onSelectExperiment: (experiment: ExperimentIndexItem) => void;
    currentExperimentId?: string | null;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    onSelectExperiment,
    currentExperimentId,
    isOpen,
    setIsOpen
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({
        'chatgpt': true,
        'qwen': true
    });

    const experiments = indexData as ExperimentIndexItem[];

    const filteredExperiments = useMemo(() => {
        return experiments.filter(exp =>
            exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [experiments, searchTerm]);

    const groupedExperiments = useMemo(() => {
        const groups: Record<string, ExperimentIndexItem[]> = {};
        filteredExperiments.forEach(exp => {
            const source = exp.source || 'qwen';
            if (!groups[source]) groups[source] = [];
            groups[source].push(exp);
        });
        return groups;
    }, [filteredExperiments]);

    const toggleSource = (source: string) => {
        setExpandedSources(prev => ({
            ...prev,
            [source]: !prev[source]
        }));
    };

    const sourceLabels: Record<string, string> = {
        'qwen': 'Qwen 2.5 Audio',
        'chatgpt': 'ChatGPT'
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={clsx(
                "fixed left-0 top-0 bottom-0 w-80 bg-black/90 border-r border-white/10 z-50 transition-transform duration-300 backdrop-blur-xl flex flex-col font-sans",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-white/80 font-bold flex items-center gap-2 mb-4">
                        <Database className="w-5 h-5 text-blue-400" />
                        Experiment Explorer
                    </h2>

                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search experiments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {Object.entries(groupedExperiments).map(([source, groupExps]) => (
                        <div key={source} className="mb-4">
                            <button
                                onClick={() => toggleSource(source)}
                                className="w-full flex items-center justify-between p-2 text-xs font-bold text-white/40 uppercase tracking-wider hover:text-white/60 transition-colors"
                            >
                                <span>{sourceLabels[source] || source} ({groupExps.length})</span>
                                <ChevronRight className={clsx("w-3 h-3 transition-transform", expandedSources[source] ? "rotate-90" : "")} />
                            </button>

                            {expandedSources[source] && (
                                <div className="space-y-1 mt-1">
                                    {groupExps.map(exp => (
                                        <button
                                            key={exp.id}
                                            onClick={() => {
                                                onSelectExperiment(exp);
                                                if (window.innerWidth < 768) setIsOpen(false);
                                            }}
                                            className={clsx(
                                                "w-full text-left p-3 rounded-lg transition-all group relative overflow-hidden",
                                                currentExperimentId === exp.id
                                                    ? "bg-blue-500/20 text-blue-200 ring-1 ring-blue-500/50"
                                                    : "hover:bg-white/5 text-white/60 hover:text-white/90"
                                            )}
                                        >
                                            <div className="flex items-start gap-3 relative z-10">
                                                <FlaskConical className={clsx(
                                                    "w-4 h-4 mt-0.5 shrink-0 transition-colors",
                                                    currentExperimentId === exp.id ? "text-blue-400" : "text-white/20 group-hover:text-white/40"
                                                )} />
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate text-sm">
                                                        {exp.title}
                                                    </div>
                                                    <div className="text-[10px] mt-0.5 opacity-60 font-mono truncate">
                                                        {exp.id.split('_').pop()}
                                                    </div>
                                                </div>

                                                {currentExperimentId === exp.id && (
                                                    <ChevronRight className="w-4 h-4 ml-auto self-center text-blue-400/50" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {Object.keys(groupedExperiments).length === 0 && (
                        <div className="p-4 text-center text-white/20 text-sm">
                            No experiments found
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-white/10 text-[10px] text-white/20 text-center">
                    Found {experiments.length} total experiments
                </div>
            </div>

             {/* Toggle Button (when closed on mobile) */}
             {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed left-4 bottom-4 md:hidden z-40 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors border border-white/10 shadow-lg"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
        </>
    );
};
