'use client';

import { createContext, useContext, useTransition, useState, ReactNode, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startTransition: (callback: () => void) => void;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransitionReact] = useTransition();
  const [manualLoadingCount, setManualLoadingCount] = useState(0);

  const showLoading = useCallback(() => {
    setManualLoadingCount((c) => c + 1);
  }, []);

  const hideLoading = useCallback(() => {
    setManualLoadingCount((c) => Math.max(0, c - 1));
  }, []);

  const startTransition = useCallback((callback: () => void) => {
    startTransitionReact(() => {
      callback();
    });
  }, [startTransitionReact]);

  const isLoading = isPending || manualLoadingCount > 0;

  return (
    <LoadingContext.Provider value={{ isLoading, startTransition, showLoading, hideLoading }}>
      {isLoading && (
        <>
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes loading-bar-smooth {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(30%); }
                100% { transform: translateX(200%); }
              }
            `
          }} />
          {/* Top glowing progress bar for mobile & desktop */}
          <div className="fixed top-0 left-0 w-full h-[4px] bg-blue-100 z-[99999] overflow-hidden shadow-sm">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 w-2/3 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" 
              style={{ animation: 'loading-bar-smooth 1.2s infinite ease-in-out' }}
            />
          </div>

          {/* Floating Processing Toast Badge (Very clear on Mobile screens) */}
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-5 sm:right-6 sm:left-auto sm:translate-x-0 z-[99999] flex items-center gap-2.5 px-4 py-2 bg-gray-900/90 text-white text-xs font-semibold rounded-full shadow-2xl border border-gray-700/80 backdrop-blur-md pointer-events-none transition-all duration-200 animate-in fade-in">
            <svg className="animate-spin h-3.5 w-3.5 text-blue-400 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </div>
        </>
      )}
      <div>
        {children}
      </div>
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    return {
      isLoading: false,
      startTransition: (cb: () => void) => cb(),
      showLoading: () => {},
      hideLoading: () => {},
    };
  }
  return ctx;
}
