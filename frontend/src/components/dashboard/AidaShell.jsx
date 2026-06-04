import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AidaSidebar from './AidaSidebar';

/** AIDA layout: sidebar + main (chat, settings, ...) */
const AidaShell = ({ children, chatSidebarProps }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isChat = location.pathname === '/';

  return (
    <div className="aida-shell flex h-screen overflow-hidden">
      <AidaSidebar
        minimal={!isChat}
        {...(isChat ? chatSidebarProps : {})}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="aida-icon-btn absolute left-3 top-3 z-30 lg:hidden"
          aria-label="Мәзір"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

export default AidaShell;
