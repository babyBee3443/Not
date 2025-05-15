
"use client";

import type { HistoryEntry } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItemCardProps {
  item: HistoryEntry;
  isFavorite: boolean;
  onSelectItem: (item: HistoryEntry) => void;
  onToggleFavorite: (itemId: string) => void;
}

export function ActivityItemCard({ item, isFavorite, onSelectItem, onToggleFavorite }: ActivityItemCardProps) {
  return (
    <Card className="mb-2 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectItem(item)}
            className="flex-grow text-left pr-2"
            aria-label={`Select item: ${item.turkishInput}`}
          >
            <p className="text-sm font-medium text-foreground truncate" title={item.turkishInput}>
              {item.turkishInput}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.timestamp).toLocaleDateString()} - {item.mode}
            </p>
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(item.id)}
            className={cn(
              "h-8 w-8 flex-shrink-0",
              isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
