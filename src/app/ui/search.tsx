'use client';

import { Suspense } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useLoading } from './loading-context';

function SearchInput({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const { isLoading, startTransition } = useLoading();

  const handleSearch = useDebouncedCallback((term: string, number: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', number)
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }, 400);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-1.5 pl-10 pr-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value, '1');
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />

      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-white/90 px-1 py-0.5 rounded pointer-events-none">
          <svg className="animate-spin h-4 w-4 text-blue-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
}

export default function Search(props: { placeholder: string }) {
  return (
    <Suspense fallback={<div className="h-[38px] w-full bg-gray-100 rounded-md animate-pulse" />}>
      <SearchInput {...props} />
    </Suspense>
  );
}

