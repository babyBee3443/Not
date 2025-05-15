
"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar, // Import useSidebar hook
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { HistoryEntry } from '@/lib/types';
import { Star, Trash2, Clock, Heart, ListChecks } from 'lucide-react'; // Added ListChecks
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"; // Import Tooltip components

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
  const { state: sidebarState, isMobile } = useSidebar();
  const favoriteEntries = history.filter(item => favorites.includes(item.id));

  // Tooltips are enabled when sidebar is collapsed and not on mobile (where it's a full sheet)
  const enableTooltips = sidebarState === 'collapsed' && !isMobile;

  const renderHistoryItem = (item: HistoryEntry) => (
    <SidebarMenuItem key={item.id} className="group/menu-item">
      <div className="flex w-full items-center justify-between p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
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
      <SidebarHeader className={`p-4 border-b ${(sidebarState === 'collapsed' && !isMobile) ? 'flex items-center justify-center h-[65px]' : 'h-[65px]'}`}>
        {(sidebarState === 'expanded' || isMobile) ? (
          <h3 className="text-lg font-semibold text-sidebar-primary">Activity</h3>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-sidebar-primary">
                <ListChecks className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left"><p>Activity</p></TooltipContent>
          </Tooltip>
        )}
      </SidebarHeader>
      <SidebarContent className="p-0">
        <Tabs defaultValue="history" className="w-full flex flex-col h-full">
          <TabsList 
            className={`rounded-none border-b 
            ${(sidebarState === 'collapsed' && !isMobile) 
              ? 'flex flex-col h-auto w-full items-stretch' 
              : 'grid w-full grid-cols-2'}`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="history" 
                  className={`gap-1 rounded-none data-[state=active]:shadow-none 
                  ${(sidebarState === 'collapsed' && !isMobile) 
                    ? 'flex-grow w-full py-3 data-[state=active]:border-l-2 data-[state=active]:border-b-0 data-[state=active]:border-primary justify-center' 
                    : 'data-[state=active]:border-b-2 data-[state=active]:border-primary'}`}
                >
                  <Clock className="h-4 w-4" />
                  {(sidebarState === 'expanded' || isMobile) && <span className="ml-1">History</span>}
                </TabsTrigger>
              </TooltipTrigger>
              {enableTooltips && <TooltipContent side="left"><p>History</p></TooltipContent>}
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="favorites" 
                  className={`gap-1 rounded-none data-[state=active]:shadow-none 
                  ${(sidebarState === 'collapsed' && !isMobile) 
                    ? 'flex-grow w-full py-3 data-[state=active]:border-l-2 data-[state=active]:border-b-0 data-[state=active]:border-primary justify-center' 
                    : 'data-[state=active]:border-b-2 data-[state=active]:border-primary'}`}
                >
                   <Heart className="h-4 w-4" />
                   {(sidebarState === 'expanded' || isMobile) && <span className="ml-1">Favorites</span>}
                </TabsTrigger>
              </TooltipTrigger>
              {enableTooltips && <TooltipContent side="left"><p>Favorites</p></TooltipContent>}
            </Tooltip>
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
                <SidebarMenu>{favoriteEntries.map(item => renderHistoryItem(item))}</SidebarMenu>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size={(sidebarState === 'expanded' || isMobile) ? 'sm' : 'icon'} 
              onClick={onClearHistory} 
              disabled={history.length === 0}
              className="w-full"
              aria-label="Clear All History"
            >
              <Trash2 className={`h-4 w-4 ${(sidebarState === 'expanded' || isMobile) ? 'mr-2' : ''}`} />
              {(sidebarState === 'expanded' || isMobile) && <span>Clear All History</span>}
            </Button>
          </TooltipTrigger>
          {enableTooltips && <TooltipContent side="left"><p>Clear All History</p></TooltipContent>}
        </Tooltip>
         <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size={(sidebarState === 'expanded' || isMobile) ? 'sm' : 'icon'} 
              onClick={onClearFavorites} 
              disabled={favorites.length === 0}
              className="w-full" // Removed mt-2 as SidebarFooter is already flex-col with space-y-2
              aria-label="Clear All Favorites"
            >
              <Trash2 className={`h-4 w-4 ${(sidebarState === 'expanded' || isMobile) ? 'mr-2' : ''}`} />
              {(sidebarState === 'expanded' || isMobile) && <span>Clear All Favorites</span>}
            </Button>
          </TooltipTrigger>
          {enableTooltips && <TooltipContent side="left"><p>Clear All Favorites</p></TooltipContent>}
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}

