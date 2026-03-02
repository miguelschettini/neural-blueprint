import React from 'react';
import { Cpu, Zap, ShieldCheck } from 'lucide-react';

export const Marquee = () => (
  <div className="py-10 border-y border-white/5 overflow-hidden bg-black relative">
    <div className="animate-marquee whitespace-nowrap flex gap-24 items-center">
      {[...Array(10)].map((_, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-4">
            <Cpu className="w-4 h-4 text-neon-green/30" />
            <span className="text-xl font-display font-black uppercase tracking-[0.4em] text-white/10">Neural_Sync</span>
          </div>
          <div className="flex items-center gap-4">
            <Zap className="w-4 h-4 text-neon-green/30" />
            <span className="text-xl font-display font-black uppercase tracking-[0.4em] text-white/10">High_Performance</span>
          </div>
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-4 h-4 text-neon-green/30" />
            <span className="text-xl font-display font-black uppercase tracking-[0.4em] text-white/10">Encrypted_Data</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  </div>
);
