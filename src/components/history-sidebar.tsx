"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { HistoryEntry } from '@/lib/types';
import { Star, Trash2, Clock, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';

interface HistorySidebarProps {
  history: HistoryEntry[];
  favorites: string[];
  onSelectHistoryItem: (item: HistoryEntry) => void;
  onToggleFavorite: (itemId: string) => void;
  onClearHistory: () => void;
  onClearFavorites: () => void;
}

export function HistorySidebar({
  history,
  favorites,
  onSelectHistoryItem,
  onToggleFavorite,
  onClearHistory,
  onClearFavorites,
}: HistorySidebarProps) {
  
  const favoriteEntries = history.filter(item => favorites.includes(item.id));

  const renderHistoryItem = (item: HistoryEntry, isFavoriteList: boolean = false) => (
    <SidebarMenuItem key={item.id} className="group/menu-item">
      <div className="flex w-full items-center justify-between p-2 rounded-md hover:bg-sidebar-accent transition-colors">
        <button
          onClick={() => onSelectHistoryItem(item)}
          className="flex-grow text-left truncate"
          title={item.turkishInput}
        >
          <span className="block text-sm font-medium text-sidebar-foreground truncate">{item.turkishInput}</span>
          <span className="block text-xs text-sidebar-foreground/70">
            {new Date(item.timestamp).toLocaleDateString()} - {item.mode}
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleFavorite(item.id)}
          className="ml-2 h-7 w-7 flex-shrink-0"
          aria-label={favorites.includes(item.id) ? "Unfavorite" : "Favorite"}
        >
          <Star className={`h-4 w-4 ${favorites.includes(item.id) ? 'fill-yellow-400 text-yellow-500' : 'text-sidebar-foreground/50'}`} />
        </Button>
      </div>
    </SidebarMenuItem>
  );

  return (
    <Sidebar side="right" collapsible="icon" className="border-l">
      <SidebarHeader className="p-4">
        <h3 className="text-lg font-semibold text-sidebar-primary">Activity</h3>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <Tabs defaultValue="history" className="w-full flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
            <TabsTrigger value="history" className="gap-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
              <Clock className="h-4 w-4" /> History
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
               <Heart className="h-4 w-4" /> Favorites
            </TabsTrigger>
          </TabsList>
          <TabsContent value="history" className="flex-grow overflow-hidden mt-0">
            <ScrollArea className="h-full p-2">
              {history.length === 0 ? (
                <p className="p-4 text-center text-sm text-sidebar-foreground/70">No history yet.</p>
              ) : (
                <SidebarMenu>{history.map(item => renderHistoryItem(item))}</SidebarMenu>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="favorites" className="flex-grow overflow-hidden mt-0">
            <ScrollArea className="h-full p-2">
              {favoriteEntries.length === 0 ? (
                <p className="p-4 text-center text-sm text-sidebar-foreground/70">No favorites yet.</p>
              ) : (
                <SidebarMenu>{favoriteEntries.map(item => renderHistoryItem(item, true))}</SidebarMenu>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearHistory} 
          disabled={history.length === 0}
          className="w-full"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Clear All History
        </Button>
         <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearFavorites} 
          disabled={favorites.length === 0}
          className="w-full mt-2"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Clear All Favorites
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
