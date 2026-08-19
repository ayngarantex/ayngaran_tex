'use client'
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export interface DropdownItem {
    id: string | number;
    label: string;
}

interface SearchDropdownProps {
    items: DropdownItem[];
    onSelect: (item: DropdownItem | null) => void;
    label?: string;
    placeholder?: string;
    /** Optional "+ create" link shown beside the input */
    createLink?: string;
    /** Optional controlled value — syncs the displayed text from outside */
    value?: string;
    hideLabel?: boolean;
    showUserIcon?: boolean;
    className?: string;
}

export default function SearchDropdown({
    items,
    onSelect,
    label = 'Choose an option',
    placeholder = 'Search...',
    createLink,
    value,
    hideLabel = false,
    showUserIcon = true,
    className,
}: SearchDropdownProps) {
    const [search, setSearch] = useState(value ?? '');
    const [showDropdown, setShowDropdown] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Keep internal text in sync when the parent changes `value`
    useEffect(() => {
        if (value !== undefined) setSearch(value ?? '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = items.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={className || (hideLabel ? "" : "mb-4")}>
            {!hideLabel && (
                <label htmlFor="searchDropdownInput" className="mb-2 block text-sm font-medium">
                    {label}
                </label>
            )}
            <div className="flex">
                <div className="relative flex-1" ref={ref}>
                    {showUserIcon && (
                        <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 z-10" />
                    )}
                    <input
                        id="searchDropdownInput"
                        type="text"
                        autoComplete="off"
                        placeholder={placeholder}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowDropdown(true);
                            if (!e.target.value) onSelect(null);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className={`peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 ${showUserIcon ? 'pl-10' : 'pl-3'} text-sm outline-2 placeholder:text-gray-500`}
                    />
                    {showDropdown && (
                        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-400 shadow-lg text-sm bg-white">
                            {filtered.map((item) => (
                                <li
                                    key={item.id}
                                    onMouseDown={() => {
                                        onSelect(item);
                                        setSearch(item.label);
                                        setShowDropdown(false);
                                    }}
                                    className="cursor-pointer px-4 py-2 hover:bg-blue-50 bg-white"
                                >
                                    {item.label}
                                </li>
                            ))}
                            {filtered.length === 0 && (
                                <li className="px-4 py-2 text-gray-400">No results found</li>
                            )}
                        </ul>
                    )}
                </div>

                {createLink && (
                    <Link
                        href={createLink}
                        className="flex h-10 items-center rounded-lg bg-blue-400 px-4 text-2xl font-medium text-white"
                    >
                        +
                    </Link>
                )}
            </div>
        </div>
    );
}
