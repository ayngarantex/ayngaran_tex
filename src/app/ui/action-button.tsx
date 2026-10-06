'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoading } from './loading-context';

export function ActionLink({
  href,
  children,
  className,
  title,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const { startTransition } = useLoading();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return;
    setIsNavigating(true);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      title={title}
      className={`${className || ''} ${isNavigating ? 'opacity-60 cursor-wait pointer-events-none' : ''}`}
    >
      {isNavigating ? (
        <svg className="w-5 h-5 animate-spin text-blue-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        children
      )}
    </Link>
  );
}

export function ActionButton({
  onClick,
  children,
  className,
  title,
  disabled,
  type = 'button',
}: {
  onClick?: () => void | Promise<any>;
  children: React.ReactNode;
  className?: string;
  title?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  const handleClick = async () => {
    if (isProcessing || disabled) return;
    setIsProcessing(true);
    showLoading();
    try {
      if (onClick) await onClick();
    } finally {
      setIsProcessing(false);
      hideLoading();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      title={title}
      disabled={disabled || isProcessing}
      className={`${className || ''} ${isProcessing ? 'opacity-60 cursor-wait pointer-events-none' : ''}`}
    >
      {isProcessing ? (
        <svg className="w-5 h-5 animate-spin text-blue-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
