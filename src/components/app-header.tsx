import Link from 'next/link';
import { FlaskConical, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useSidebar } from '@/components/ui/sidebar';

export function AppHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label="Kenar Çubuğunu Aç/Kapat"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">BioLinguaLearn</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <Button
            variant="outline"
            size="icon"
            className="hidden md:inline-flex"
            onClick={toggleSidebar}
            aria-label="Kenar Çubuğunu Aç/Kapat"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
