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
  const { startTransition } = useLoading();

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
  }, 500)

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-1.5 pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value, '1');
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />

      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
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

