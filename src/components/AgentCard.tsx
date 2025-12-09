import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import type { ValidTimelineEvent } from '../types';
import { ChevronDown, ChevronUp, Bot, BrainCircuit, Terminal, Palette, Mic, Activity } from 'lucide-react';
import { ImageGallery } from './ImageGallery';

interface AgentCardProps {
  event: ValidTimelineEvent;
  isCompact?: boolean; // For squad views
}

// Map roles to colors and icons
const getAgentStyle = (role: string) => {
  const normalized = role.toLowerCase();

  // Helper to ensure consistent icon sizing
  const iconProps = { className: "w-5 h-5" };

  if (normalized.includes('interpreter')) return {
      color: 'border-blue-500/30 bg-blue-500/5',
      icon: <Mic {...(iconProps as any)} className="w-5 h-5 text-blue-400" />,
      badge: 'border-blue-500/30 text-blue-400',
      label: 'INTERPRETER'
  };
  if (normalized.includes('visual')) return {
      color: 'border-purple-500/30 bg-purple-500/5',
      icon: <Palette {...(iconProps as any)} className="w-5 h-5 text-purple-400" />,
      badge: 'border-purple-500/30 text-purple-400',
      label: 'VISUAL DIRECTOR'
  };
  if (normalized.includes('concept')) return {
      color: 'border-emerald-500/30 bg-emerald-500/5',
      icon: <BrainCircuit {...(iconProps as any)} className="w-5 h-5 text-emerald-400" />,
      badge: 'border-emerald-500/30 text-emerald-400',
      label: 'CONCEPT ARCHITECT'
  };
  if (normalized.includes('sdxl') || normalized.includes('system')) return {
      color: 'border-gray-500/30 bg-gray-500/5',
      icon: <Terminal {...(iconProps as any)} className="w-5 h-5 text-gray-400" />,
      badge: 'border-gray-500/30 text-gray-400',
      label: 'SYSTEM'
  };
  if (normalized.includes('orchestrator')) return {
      color: 'border-amber-500/30 bg-amber-500/5',
      icon: <Bot {...(iconProps as any)} className="w-5 h-5 text-amber-400" />,
      badge: 'border-amber-500/30 text-amber-400',
      label: 'ORCHESTRATOR'
  };
  if (normalized.includes('critic')) return {
      color: 'border-red-500/30 bg-red-500/5',
      icon: <Activity {...(iconProps as any)} className="w-5 h-5 text-red-400" />,
      badge: 'border-red-500/30 text-red-400',
      label: 'CRITIC'
  };

  // Squad Members (Default)
  return {
      color: 'border-cyan-500/30 bg-cyan-500/5',
      icon: <Bot {...(iconProps as any)} className="w-5 h-5 text-cyan-400" />,
      badge: 'border-cyan-500/30 text-cyan-400',
      label: 'SQUAD MEMBER'
  };
};

export const AgentCard: React.FC<AgentCardProps> = ({ event, isCompact = false }) => {
  const [expanded, setExpanded] = useState(false);
  const { color, icon } = getAgentStyle(event.agent || 'System');

  const isImageGen = event.type === 'image';
  const isJsonContent = typeof event.content === 'object';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "relative rounded-xl border backdrop-blur-md transition-all duration-300 overflow-hidden",
        color,
        "hover:border-opacity-60 hover:shadow-lg hover:shadow-white/5",
        isCompact ? "mb-3" : "mb-6"
      )}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={cn(
            "flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer",
            isCompact ? "p-3" : "p-4"
        )}
      >
        <div className="flex items-start justify-between gap-4 w-full">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-white/5 border border-white/10", color)}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white/90">{event.agent}</h3>
            </div>

            {/* COMPACT VIEW: Show Scores Inline if available */}
             {event.scores && (
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70 font-mono">
                  {Object.entries(event.scores).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1">
                      <span className="opacity-50 uppercase">{key.replace(/_/g, ' ')}:</span>
                      <span className={cn("font-bold", typeof val === 'number' && val < 4 ? "text-red-400" : "text-green-400")}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>
        <div className="p-1 text-white/40">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {(expanded || isImageGen) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-white/5">
              {/* Text Content */}
              {!isImageGen && (
                <div className="mt-4 text-sm text-white/80 font-mono bg-black/30 p-4 rounded-xl overflow-x-auto">
                    {isJsonContent ? (
                        <pre>{JSON.stringify(event.content, null, 2)}</pre>
                    ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{event.content}</p>
                    )}
                </div>
              )}

              {/* Images */}
              {isImageGen && event.images && (
                 <ImageGallery images={event.images} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
