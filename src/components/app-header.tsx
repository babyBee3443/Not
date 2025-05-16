// src/components/app-header.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlaskConical, BookOpenCheck, Newspaper, Menu, X, BrainCircuit, ScanLine } from 'lucide-react'; // Added ScanLine
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import * as React from 'react';

export function AppHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: '/', label: 'Çeviri', icon: FlaskConical },
    { href: '/notes', label: 'Not Oluştur', icon: BookOpenCheck },
    { href: '/test', label: 'Test Oluştur', icon: Newspaper },
    { href: '/exercises', label: 'Alıştırmalar', icon: BrainCircuit },
    { href: '/scan-question', label: 'Soru Tara', icon: ScanLine }, // New Scan Question link
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <FlaskConical className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">BioLinguaLearn</h1>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menüyü Aç</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm">
                <SheetHeader className="mb-6 flex flex-row justify-between items-center">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                     <FlaskConical className="h-6 w-6 text-primary" />
                     <SheetTitle className="text-xl font-bold">BioLinguaLearn</SheetTitle>
                  </Link>
                  <SheetClose asChild>
                     <Button variant="ghost" size="icon" className="rounded-full">
                       <X className="h-5 w-5" />
                       <span className="sr-only">Kapat</span>
                     </Button>
                  </SheetClose>
                </SheetHeader>
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md p-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
