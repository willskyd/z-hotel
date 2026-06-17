'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface SidebarContextType {
  expanded: boolean;
  pinned: boolean;
  togglePin: () => void;
  setHovered: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  expanded: false,
  pinned: false,
  togglePin: () => {},
  setHovered: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHoveredState] = useState(false);

  const togglePin = useCallback(() => {
    setPinned((v) => !v);
  }, []);

  const setHovered = useCallback((v: boolean) => {
    setHoveredState(v);
  }, []);

  return (
    <SidebarContext.Provider
      value={{ expanded: pinned || hovered, pinned, togglePin, setHovered }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
