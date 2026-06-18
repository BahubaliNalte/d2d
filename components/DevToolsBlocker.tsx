'use client';

import { useEffect } from 'react';

const DevToolsBlocker = () => {
  useEffect(() => {
    // Only run in production and on non-localhost hosts unless explicitly allowed.
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const host = window.location.hostname;
      const urlParams = new URLSearchParams(window.location.search);
      const bypass = urlParams.get('allowDevTools') === '1' || localStorage.getItem('allowDevTools') === '1';
      if (!isProduction || host === 'localhost' || host === '127.0.0.1' || bypass) {
        return;
      }
    } catch (err) {
      // If anything goes wrong determining environment, skip blocking to avoid breaking users.
      return;
    }

    // 🔒 Disable right-click
    const disableContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', disableContextMenu);

    // 🔐 Block key combinations like F12, Ctrl+Shift+I, etc.
    const blockKeys = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    document.addEventListener('keydown', blockKeys);

    // 🕵️ Detect DevTools by window size (non-destructive)
    const detectDevTools = setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > 100 ||
        window.outerWidth - window.innerWidth > 100
      ) {
        // Avoid replacing the entire document body which breaks the app.
        // Instead add a non-destructive overlay element the user can dismiss.
        if (!document.getElementById('devtools-blocker-overlay')) {
          const overlay = document.createElement('div');
          overlay.id = 'devtools-blocker-overlay';
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.display = 'flex';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          overlay.style.background = 'rgba(0,0,0,0.6)';
          overlay.style.color = '#fff';
          overlay.style.zIndex = '9999';
          overlay.style.padding = '20px';
          overlay.innerText = 'DevTools detected. Please close DevTools to continue.';
          overlay.addEventListener('click', () => {
            overlay.remove();
          });
          document.body.appendChild(overlay);
        }
      }
    }, 1000);

    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', blockKeys);
      clearInterval(detectDevTools);
    };
  }, []);

  return null;
};

export default DevToolsBlocker;
