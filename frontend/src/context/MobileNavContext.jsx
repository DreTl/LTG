import { createContext, useContext, useState } from 'react';

const MobileNavContext = createContext(null);

export function MobileNavProvider({ children }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);
  return (
    <MobileNavContext.Provider value={{ open, setOpen, toggle, close }}>
      {children}
    </MobileNavContext.Provider>
  );
}

/** Returns the mobile-nav controls, or null when used outside an admin shell. */
export function useMobileNav() {
  return useContext(MobileNavContext);
}
