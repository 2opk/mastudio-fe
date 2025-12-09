import React from 'react';
import type { TimelinePhase, SquadSession } from '../types';
import { AgentCard } from './AgentCard';
import { cn } from '../utils/cn';

interface TimelineProps {
  phases: TimelinePhase[];
}

const PhaseHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-8 relative z-10 w-full mb-8">
    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-textMuted uppercase tracking-widest backdrop-blur-md mb-2">
      {subtitle || "Phase"}
    </div>
    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
      {title}
    </h2>
  </div>
);

import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SquadRow: React.FC<{ squad: SquadSession }> = ({ squad }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div className="relative border-l-2 border-white/10 pl-6 md:pl-8 py-4">
             {/* Header Label */}
            <div className={cn(
                "absolute -left-[13px] top-0 flex items-center justify-center w-6 h-6 rounded-full border bg-background z-10",
                 squad.squadId === 'harmonic' ? "border-cyan-500 text-cyan-500" :
                 squad.squadId === 'conflict' ? "border-orange-500 text-orange-500" : "border-pink-500 text-pink-500"
            )}>
                <div className="w-2 h-2 rounded-full bg-current" />
            </div>

            <div
                className="mb-6 flex items-center gap-4 cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className={cn("text-xl font-bold uppercase tracking-widest inline-block transition-colors",
                    squad.squadId === 'harmonic' ? "text-cyan-400" :
                    squad.squadId === 'conflict' ? "text-orange-400" : "text-pink-400"
                )}>
                    {squad.name}
                </h3>
                <div className="p-1 rounded-full bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {/* Content: Discussion -> Critique -> Generated Image (Stacked Rows) */}
                        <div className="space-y-10 pb-8">
                            {/* Row 1: Discussion */}
                            <div className="space-y-4">
                                 <h4 className="text-xs uppercase text-white/30 font-mono mb-4 border-b border-white/5 pb-2">Discussion & Prompt</h4>
                                {squad.events.map((ev, idx) => (
                                    <AgentCard key={`${squad.id}-${idx}`} event={ev} isCompact={true} />
                                ))}
                            </div>

                            {/* Row 2: Critique */}
                            <div className="space-y-4">
                                <h4 className="text-xs uppercase text-white/30 font-mono mb-4 border-b border-white/5 pb-2">Director Feedback</h4>
                                {squad.critiques.length > 0 ? (
                                    squad.critiques.map((ev, idx) => (
                                         <AgentCard key={`${squad.id}-crit-${idx}`} event={ev} isCompact={true} />
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-white/20 italic text-sm border border-dashed border-white/10 rounded-lg">
                                        No feedback recorded yet.
                                    </div>
                                )}
                            </div>
                            {/* Row 3: Resulting Image */}
                            <div className="space-y-4">
                                <h4 className="text-xs uppercase text-white/30 font-mono mb-4 border-b border-white/5 pb-2">Visual Output</h4>
                                {squad.generatedImage ? (
                                     <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-black/50 max-w-2xl">
                                        <img
                                            src={squad.generatedImage}
                                            alt={`${squad.name} Result`}
                                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                                            <span className="text-xs font-mono text-white/70">Generated Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-square flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5 text-white/20 text-xs text-center p-4">
                                        Image Pending
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// New Component: Round Summary
const RoundSummary: React.FC<{ squads: SquadSession[] }> = ({ squads }) => {
    return (
        <div className="mt-16 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white/80 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                Round Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {squads.map(squad => {
                    // Extract main score from first critique if available
                    const scoreEvent = squad.critiques[0];
                    const scores = scoreEvent?.scores;

                    return (
                        <div key={squad.id} className="space-y-3">
                            <h4 className={cn("text-xs uppercase tracking-wider font-mono",
                                squad.squadId === 'harmonic' ? "text-cyan-400" :
                                squad.squadId === 'conflict' ? "text-orange-400" : "text-pink-400"
                            )}>{squad.name}</h4>

                            {/* Image */}
                            <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 relative group">
                                {squad.generatedImage ? (
                                    <img
                                        src={squad.generatedImage}
                                        alt={squad.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No Image</div>
                                )}

                                {/* Score Overlay */}
                                {scores && (
                                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                        <div className="flex flex-col gap-1">
                                             {Object.entries(scores).slice(0, 2).map(([k, v]) => (
                                                <div key={k} className="flex justify-between text-[10px] font-mono">
                                                    <span className="text-white/60 uppercase">{k.replace(/_/g, ' ')}</span>
                                                    <span className={cn("font-bold", typeof v === 'number' && v < 4 ? "text-red-400" : "text-green-400")}>{v}</span>
                                                </div>
                                             ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const Timeline: React.FC<TimelineProps> = ({ phases }) => {
  return (
    <div className="relative max-w-7xl mx-auto px-4 py-8 pb-32">
      {phases.map((phase) => (
        <div key={phase.id} className="mb-32">

          <PhaseHeader title={phase.title} subtitle={phase.type.toUpperCase()} />

          {/* PHASE 0: SETUP */}
          {phase.type === 'setup' && phase.setupEvents && (
            <div className="max-w-3xl mx-auto space-y-6">
              {phase.setupEvents.map((ev) => (
                 <AgentCard key={ev.id} event={ev} />
              ))}
            </div>
          )}

          {/* ROUNDS: 3 Rows (Collapsed) + Summary Grid */}
          {phase.type === 'round' && phase.squads && (
            <div className="space-y-16">
                {/* Squad Rows */}
                <div className="space-y-4">
                    {phase.squads.map(squad => (
                        <SquadRow key={squad.id} squad={squad} />
                    ))}
                </div>

                {/* Round Summary Grid */}
                <RoundSummary squads={phase.squads} />
            </div>
          )}

          {/* FINAL PHASE */}
           {phase.type === 'final' && phase.finalEvents && (
            <div className="max-w-4xl mx-auto space-y-6">
              {phase.finalEvents.map((ev) => (
                 <AgentCard key={ev.id} event={ev} />
              ))}
            </div>
          )}

        </div>
      ))}
    </div>
  );
};
