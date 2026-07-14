import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SectionHeaderVariant } from './SectionScreenHeader';

export type SectionHeaderConfig = {
  title?: string;
  subtitle?: string;
  variant?: SectionHeaderVariant;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  hidden?: boolean;
};

type SectionHeaderContextValue = {
  config: SectionHeaderConfig | null;
  setConfig: (config: SectionHeaderConfig | null) => void;
};

const SectionHeaderContext = createContext<SectionHeaderContextValue | null>(null);

export function SectionHeaderProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<SectionHeaderConfig | null>(null);

  const setConfig = useCallback((next: SectionHeaderConfig | null) => {
    setConfigState(next);
  }, []);

  const value = useMemo(() => ({ config, setConfig }), [config, setConfig]);

  return (
    <SectionHeaderContext.Provider value={value}>
      {children}
    </SectionHeaderContext.Provider>
  );
}

export function useSectionHeader() {
  const context = useContext(SectionHeaderContext);
  if (!context) {
    throw new Error('useSectionHeader must be used within SectionHeaderProvider');
  }
  return context;
}
