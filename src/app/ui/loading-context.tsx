'use client';

import { createContext, useContext, useTransition, ReactNode } from 'react';

const LoadingContext = createContext<{
  isLoading: boolean;
  startTransition: (callback: () => void) => void;
} | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();

  return (
    <LoadingContext.Provider value={{ isLoading: isPending, startTransition }}>
      {isPending && (
        <>
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes loading-bar {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
              }
            `
          }} />
          <div className="fixed top-0 left-0 w-full h-[3px] bg-slate-200 z-[9999] overflow-hidden">
            <div 
              className="h-full bg-blue-600 w-1/2" 
              style={{ animation: 'loading-bar 1.5s infinite linear' }}
            />
          </div>
        </>
      )}
      <div className={`transition-opacity duration-300 ${isPending ? 'opacity-65 pointer-events-none' : 'opacity-100'}`}>
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
    };
  }
  return ctx;
}
