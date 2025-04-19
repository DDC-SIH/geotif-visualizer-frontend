import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MapPin, Navigation } from "lucide-react";
import { FormEvent } from "react";

interface SearchResult {
  display_name: string;
  boundingbox?: string[];
  lon: string;
  lat: string;
}

interface SearchPanelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchMode: 'coordinates' | 'location';
  setSearchMode: (mode: 'coordinates' | 'location') => void;
  isSearching: boolean;
  searchResults: SearchResult[];
  onSearch: (e: FormEvent) => void;
  onResultClick: (result: SearchResult) => void;
}

export function SearchPanel({
  searchQuery,
  setSearchQuery,
  searchMode,
  setSearchMode,
  isSearching,
  searchResults,
  onSearch,
  onResultClick
}: SearchPanelProps) {
  return (
    <div className="absolute top-16 right-5 z-[1001] bg-neutral-900/80 backdrop-blur-sm p-3 rounded-md border border-neutral-800 w-80">
      <div className="flex mb-2">
        <Button
          onClick={() => setSearchMode('location')}
          className={cn(
            "flex-1 gap-1 rounded-r-none",
            searchMode === 'location'
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-neutral-800 hover:bg-neutral-700 text-white"
          )}
          size="sm"
        >
          <MapPin size={14} /> Location
        </Button>
        <Button
          onClick={() => setSearchMode('coordinates')}
          className={cn(
            "flex-1 gap-1 rounded-l-none",
            searchMode === 'coordinates'
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-neutral-800 hover:bg-neutral-700 text-white"
          )}
          size="sm"
        >
          <Navigation size={14} /> Coordinates
        </Button>
      </div>

      <form onSubmit={onSearch} className="flex">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchMode === 'coordinates'
            ? "Enter coordinates (lon, lat)"
            : "Search for a location..."}
          className="rounded-r-none bg-neutral-800 text-white border-neutral-700 focus:border-primary"
        />
        <Button
          type="submit"
          disabled={isSearching}
          className={cn(
            "rounded-l-none",
            isSearching ? "opacity-50" : ""
          )}
        >
          {isSearching ? "..." : "Go"}
        </Button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mt-2 max-h-[200px] overflow-y-auto custom-scrollbar border border-neutral-700 rounded-md">
          {searchResults.map((result, index) => (
            <div
              key={index}
              onClick={() => onResultClick(result)}
              className={cn(
                "p-2 cursor-pointer hover:bg-neutral-700/70 bg-neutral-800/70",
                index < searchResults.length - 1 ? "border-b border-neutral-700" : ""
              )}
            >
              <div className="font-medium text-primary-foreground">{result.display_name.split(',')[0]}</div>
              <div className="text-xs text-neutral-400 truncate">
                {result.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}