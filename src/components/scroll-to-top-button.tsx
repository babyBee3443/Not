
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  React.useEffect(() => {
    // Ensure window is defined (runs only on client)
    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', toggleVisibility);
        // Call it once to set initial state
        toggleVisibility(); 
        return () => {
        window.removeEventListener('scroll', toggleVisibility);
        };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full shadow-lg transition-opacity duration-300 ease-in-out hover:scale-110 hover:bg-accent",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-label="Yukarı çık"
    >
      <ArrowUp className="h-6 w-6" />
    </Button>
  );
}
