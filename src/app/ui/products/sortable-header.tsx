'use client';

import { Suspense } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useLoading } from '@/app/ui/loading-context';

function SortableHeaderContent({
  field,
  label,
  className = "",
}: {
  field: string;
  label: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { startTransition } = useLoading();

  const currentSortBy = searchParams.get('sortBy');
  const currentSortOrder = searchParams.get('sortOrder')?.toLowerCase() || 'desc';
  const isActive = currentSortBy === field;

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (isActive) {
      params.set('sortOrder', currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sortBy', field);
      params.set('sortOrder', field === 'name' ? 'asc' : 'desc');
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Sort by ${label}`}
      className={`group inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs sm:text-sm cursor-pointer select-none transition-colors hover:text-blue-600 ${
        isActive ? 'text-blue-700 font-extrabold' : 'text-slate-900'
      } ${className}`}
    >
      <span>{label}</span>
      <span className="inline-flex items-center">
        {isActive ? (
          <span className="inline-flex items-center text-blue-700 bg-blue-100/80 rounded px-0.5 py-0.5 shadow-2xs">
            {currentSortOrder === 'asc' ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </span>
        ) : (
          <span className="text-slate-400 group-hover:text-slate-600 opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </span>
        )}
      </span>
    </button>
  );
}

export default function SortableHeader(props: {
  field: string;
  label: string;
  className?: string;
}) {
  return (
    <Suspense fallback={<span>{props.label}</span>}>
      <SortableHeaderContent {...props} />
    </Suspense>
  );
}

