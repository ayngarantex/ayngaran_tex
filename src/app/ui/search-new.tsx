'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function SearchNew({
  placeholder,
  onSearch,
}: {
  placeholder: string;
  onSearch: (text: string) => void;
}) {
  const [search, setSearch] = useState("");

  // debounce so search doesn’t fire on every keystroke
  const handleSearch = useDebouncedCallback((term: string) => {
    onSearch(term);  // call parent callback
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        className="peer block w-full rounded-md border border-gray-200 py-1.5 pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          const val = e.target.value;
          setSearch(val);   // update local input
          handleSearch(val); // debounce parent update
        }}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
