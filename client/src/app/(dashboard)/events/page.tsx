"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Calendar, MapPin, Globe, ExternalLink, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { eventService } from "@/lib/services/event.service";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Event } from "@/types/event";
import Image from "next/image";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUpcoming, setFilterUpcoming] = useState<"true" | "false" | "">("");
  const [filterType, setFilterType] = useState<string>("");
  const [processingBookmarks, setProcessingBookmarks] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eventService.getEvents({
        search: searchQuery || undefined,
        upcoming: filterUpcoming || undefined,
        type: filterType || undefined,
      });
      setEvents(response.events);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterUpcoming, filterType]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  const handleBookmarkToggle = async (eventId: string, isBookmarked: boolean | undefined) => {
    setProcessingBookmarks(prev => new Set(prev).add(eventId));
    try {
      if (isBookmarked) {
        await eventService.removeBookmark(eventId);
        toast.success("Event removed from bookmarks");
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, _count: { bookmarks: (e._count?.bookmarks || 1) - 1 } } : e));
        // We can't immediately toggle `isBookmarked` locally since the backend only returns it for getEventById.
        // If we want to simulate it, we would add `isBookmarked` to the Event interface for getEvents too, but backend doesn't return it for list.
      } else {
        await eventService.bookmarkEvent(eventId);
        toast.success("Event bookmarked");
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, _count: { bookmarks: (e._count?.bookmarks || 0) + 1 } } : e));
      }
      void fetchData(); // Refresh to get accurate counts
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to update bookmark");
    } finally {
      setProcessingBookmarks(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterUpcoming("");
    setFilterType("");
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground mt-1">
            Discover hackathons, workshops, and meetups to grow your skills.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </form>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            className="flex h-10 w-full md:w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="hackathon">Hackathons</option>
            <option value="workshop">Workshops</option>
            <option value="meetup">Meetups</option>
            <option value="webinar">Webinars</option>
            <option value="competition">Competitions</option>
          </select>
          <select
            className="flex h-10 w-full md:w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filterUpcoming}
            onChange={(e) => setFilterUpcoming(e.target.value as "true" | "false" | "")}
          >
            <option value="">Any Time</option>
            <option value="true">Upcoming</option>
            <option value="false">Past</option>
          </select>
          {(searchQuery || filterType || filterUpcoming) && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-between">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>Retry</Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => {
            const isProcessing = processingBookmarks.has(event.id);
            const isUpcoming = new Date(event.startDate) > new Date();

            return (
              <Card key={event.id} className="overflow-hidden border shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                {event.bannerUrl ? (
                  <div className="relative h-40 w-full overflow-hidden bg-muted">
                    <Image src={event.bannerUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  </div>
                ) : (
                  <div className="h-40 w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-b">
                    <Calendar className="h-12 w-12 text-primary/30" />
                  </div>
                )}
                
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2">{event.title}</h3>
                    <span className="shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize bg-primary/10 text-primary">
                      {event.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{new Date(event.startDate).toLocaleDateString()} {isUpcoming ? "(Upcoming)" : "(Past)"}</span>
                    </div>
                    {(event.location || event.isOnline) && (
                      <div className="flex items-center gap-2">
                        {event.isOnline ? <Globe className="h-4 w-4 shrink-0" /> : <MapPin className="h-4 w-4 shrink-0" />}
                        <span className="truncate">{event.isOnline ? "Online" : event.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t mt-auto">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={event.creator?.avatarUrl || undefined} />
                        <AvatarFallback className="text-[10px]">{event.creator?.fullName?.charAt(0) || "O"}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                        {event.organizer || event.creator?.fullName || "Community"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${event.isBookmarked ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={() => handleBookmarkToggle(event.id, event.isBookmarked)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Bookmark className={`h-4 w-4 ${event.isBookmarked ? "fill-primary" : ""}`} />
                        )}
                      </Button>
                      {event.registrationUrl && (
                        <a 
                          href={event.registrationUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className={buttonVariants({ variant: "default", size: "sm", className: "h-8 gap-1" })}
                        >
                          Register <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/50 border rounded-xl border-dashed">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Calendar className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No events found</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Try adjusting your search filters or check back later for new events.
          </p>
          {(searchQuery || filterType || filterUpcoming) && (
            <Button variant="outline" className="mt-6" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
