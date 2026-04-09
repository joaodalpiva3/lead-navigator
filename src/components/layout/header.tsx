"use client";

import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-200/80 bg-white/80 backdrop-blur-sm px-4 sm:px-6">
      <MobileNav />
      <div className="flex flex-1 items-center gap-4">
        {children}
      </div>
    </header>
  );
}
