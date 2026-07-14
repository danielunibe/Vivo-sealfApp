import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function AccordionSection({ title, icon, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full vivo-surface-on-pattern p-4 flex items-center justify-between hover:shadow-md transition-all active:scale-[0.98] ${isOpen ? 'rounded-t-[1.5rem]' : 'rounded-[1.5rem]'}`}
      >
        <div className="flex items-center gap-3">
          <div className="vivo-inset-on-pattern p-2.5 rounded-xl">
            {icon}
          </div>
          <h2 className="text-sm font-black text-[var(--neo-text)] tracking-tight">{title}</h2>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-[var(--neo-muted)]" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="vivo-inset-on-pattern rounded-b-[1.5rem] border-t-0 p-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
