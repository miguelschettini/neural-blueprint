import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

export const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`group border border-white/5 transition-all duration-300 ${isOpen ? 'bg-white/[0.03] border-neon-green/30' : 'hover:bg-white/[0.01] hover:border-white/10'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 px-8 flex justify-between items-center text-left relative overflow-hidden"
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isOpen ? 'bg-neon-green shadow-[0_0_8px_#00FF00]' : 'bg-white/10'}`} />
          <span className={`text-sm md:text-base font-display font-bold uppercase tracking-wider transition-colors ${isOpen ? 'text-neon-green' : 'text-white/70 group-hover:text-white'}`}>
            {question}
          </span>
        </div>
        <div className="relative z-10">
          <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-180 text-neon-green' : 'text-white/20'}`} />
        </div>
        
        <div className={`absolute top-0 left-0 w-1 h-full bg-neon-green transition-transform duration-500 origin-top ${isOpen ? 'scale-y-100' : 'scale-y-0'}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="px-8 pb-8 pt-2 relative"
            >
              <div className="pl-6 border-l border-white/5">
                <p className="text-white/40 text-sm leading-relaxed font-light tracking-wide uppercase">
                  {answer}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 opacity-20">
                <div className="h-[1px] w-4 bg-neon-green" />
                <span className="font-mono text-[8px] uppercase tracking-widest">End_Of_Response</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
