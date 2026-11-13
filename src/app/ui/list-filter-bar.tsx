'use client';

import React, { useState, Suspense } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';

export interface ListFilterBarProps {
  search: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  hasActiveFilters?: boolean;
  className?: string;
  desktopSearchClassName?: string;
  desktopFiltersClassName?: string;
  desktopActionsClassName?: string;
}

function ListFilterBarInner({
  search,
  filters,
  actions,
  hasActiveFilters,
  className = '',
  desktopSearchClassName,
  desktopFiltersClassName,
  desktopActionsClassName,
}: ListFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  // Determine whether any non-default filters are active
  const hasActiveParam = searchParams
    ? Boolean(
        searchParams.get('startDate') ||
        searchParams.get('endDate') ||
        searchParams.get('billType') ||
        searchParams.get('orderBy') ||
        searchParams.get('productId') ||
        searchParams.get('customerId') ||
        searchParams.get('loomId') ||
        searchParams.get('sizingId') ||
        searchParams.get('loomStatus') ||
        searchParams.get('pendingDays')
      )
    : false;

  const isActive = hasActiveFilters !== undefined ? hasActiveFilters : hasActiveParam;

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile View (< md screens): Search only + Filter Toggle Icon */}
      <div className="block md:hidden w-full no-print">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 min-w-0">
            {search}
          </div>
          {(filters || actions) && (
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-label="Toggle filters and actions"
              className={`relative flex items-center justify-center p-2 rounded-lg border transition-all shrink-0 cursor-pointer h-10 w-10 ${
                isOpen
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : isActive
                  ? 'bg-blue-50 text-blue-600 border-blue-300 ring-2 ring-blue-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <>
                  <FunnelIcon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                    </span>
                  )}
                </>
              )}
            </button>
          )}
        </div>

        {/* Mobile Dropdown Panel: Revealed when filter icon is tapped */}
        {isOpen && (filters || actions) && (
          <div className="mt-3 p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
            {filters && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Filters
                </span>
                <div className="w-full flex flex-col gap-2">
                  {filters}
                </div>
              </div>
            )}
            {actions && (
              <div className={`flex flex-col gap-1.5 ${filters ? 'border-t border-slate-100 pt-2.5' : ''}`}>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {actions}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop View (>= md screens): Full wide layout */}
      <div className="hidden md:flex md:items-center md:justify-between gap-3 w-full no-print">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={desktopSearchClassName || "w-1/3 min-w-[200px] max-w-xs"}>
            {search}
          </div>
          {filters && (
            <div className={desktopFiltersClassName || "flex items-center gap-2 flex-1"}>
              {filters}
            </div>
          )}
        </div>
        {actions && (
          <div className={desktopActionsClassName || "flex items-center gap-2 flex-wrap shrink-0"}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListFilterBar(props: ListFilterBarProps) {
  return (
    <Suspense fallback={<div className="h-10 bg-slate-100 rounded-lg animate-pulse" />}>
      <ListFilterBarInner {...props} />
    </Suspense>
  );
}

