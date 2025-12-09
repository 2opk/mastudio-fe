import React from 'react';
import { motion } from 'framer-motion';
import { Music, Activity, Disc } from 'lucide-react';

interface HeroProps {
    title: string;
    metrics?: any;
    audioPath?: string;
}

export const Hero: React.FC<HeroProps> = ({ title, metrics, audioPath }) => {
  return (
    <div className="relative overflow-hidden w-full bg-surfaceHighlight/30 border-b border-white/5 pb-12 pt-20">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs uppercase tracking-widest font-bold mb-4">
            Multi-Agent Workflow
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-4">
            {title || "Audio to Image Synthesis"}
          </h1>
          <p className="text-textMuted max-w-lg mx-auto">
            Visualizing the cognitive process of AI agents interpreting music and generating visual art.
          </p>
        </motion.div>

        {audioPath && (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center mb-8"
            >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-2 pr-6 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Music size={20} />
                    </div>
                    <audio
                        controls
                        autoPlay
                        src={audioPath}
                        className="h-8 max-w-[200px]"
                    />
                </div>
            </motion.div>
        )}

        {metrics && (
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="grid grid-cols-2 md:grid-cols-4 gap-4"
           >
              <div className="glass p-4 rounded-xl flex items-center gap-3">
                 <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Activity size={20} /></div>
                 <div>
                    <div className="text-xs text-textMuted uppercase">Tempo</div>
                    <div className="font-mono font-bold">{Math.round(metrics.tempo)} BPM</div>
                 </div>
              </div>
              <div className="glass p-4 rounded-xl flex items-center gap-3">
                 <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Music size={20} /></div>
                 <div>
                    <div className="text-xs text-textMuted uppercase">Key</div>
                    <div className="font-mono font-bold">{metrics.key} {metrics.tonality}</div>
                 </div>
              </div>
               <div className="glass p-4 rounded-xl flex items-center gap-3">
                 <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Disc size={20} /></div>
                 <div>
                    <div className="text-xs text-textMuted uppercase">Signature</div>
                    <div className="font-mono font-bold">{metrics.time_signature}</div>
                 </div>
              </div>
           </motion.div>
        )}
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[120px]" />
      </div>
    </div>
  );
};
