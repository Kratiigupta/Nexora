"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { eventService } from "@/lib/services/event.service";
import type { Event } from "@/types/event";
import { useAuthStore } from "@/stores/authStore";
import {
  Calendar as CalendarIcon,
  MapPin,
  Globe,
  ExternalLink,
  Bookmark,
  ArrowLeft,
  Clock,
  Edit,
  Trash2,
  Loader2,
  Download
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { profile } = useAuthStore();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingBookmark, setIsProcessingBookmark] = useState(false);

  const fetchEvent = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await eventService.getEventById(eventId);
      setEvent(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }, status?: number } };
      if (e.response?.status === 404) {
        setError("Event not found");
      } else {
        setError(e.response?.data?.message || "Failed to load event");
      }
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchEvent();
  }, [fetchEvent]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      await eventService.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      router.push("/events");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to delete event");
      setIsDeleting(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!event) return;
    setIsProcessingBookmark(true);
    try {
      if (event.isBookmarked) {
        await eventService.removeBookmark(eventId);
        toast.success("Event removed from bookmarks");
        setEvent({ ...event, isBookmarked: false, _count: { bookmarks: (event._count?.bookmarks || 1) - 1 } });
      } else {
        await eventService.bookmarkEvent(eventId);
        toast.success("Event bookmarked");
        setEvent({ ...event, isBookmarked: true, _count: { bookmarks: (event._count?.bookmarks || 0) + 1 } });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to update bookmark");
    } finally {
      setIsProcessingBookmark(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    
    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    // We expect startDate/endDate to be valid ISO strings (UTC)
    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = formatDate(event.startDate);
    const end = formatDate(event.endDate);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nexora//Events Module//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@nexora.com`,
      `DTSTAMP:${formatDate(new Date().toISOString())}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description?.replace(/\n/g, '\\n') || ''}`,
      `LOCATION:${event.isOnline ? 'Online' : (event.location || '')}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
        <h2 className="text-2xl font-bold mb-2">{error || "Event not found"}</h2>
        <Button onClick={() => router.push("/events")}>Back to Events</Button>
      </div>
    );
  }

  const isCreator = profile?.id === event.createdBy;
  const isUpcoming = new Date(event.startDate) > new Date();

  return (
    <div className="flex-1 space-y-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-2">
        <Link href="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Events
        </Link>
        {isCreator && (
          <div className="flex items-center gap-2">
            <Link href={`/events/${event.id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        {event.bannerUrl ? (
          <div className="relative h-64 md:h-80 w-full bg-muted">
            <Image src={event.bannerUrl} alt={event.title} fill className="object-cover" priority sizes="(max-width: 1200px) 100vw, 1200px" />
          </div>
        ) : (
          <div className="h-48 md:h-64 w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-b">
            <CalendarIcon className="h-20 w-20 text-primary/30" />
          </div>
        )}
        
        <div className="p-6 md:p-8 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold capitalize bg-primary/10 text-primary">
                {event.type}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold capitalize ${isUpcoming ? 'bg-green-500/10 text-green-500' : 'bg-secondary text-secondary-foreground'}`}>
                {isUpcoming ? "Upcoming" : "Past"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={event.creator?.avatarUrl || undefined} />
                  <AvatarFallback>{event.creator?.fullName?.charAt(0) || "O"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{event.organizer || event.creator?.fullName}</p>
                  <p className="text-xs">Organizer</p>
                </div>
              </div>
              <div className="h-8 w-px bg-border hidden md:block" />
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{new Date(event.startDate).toLocaleDateString()}</p>
                  <p className="text-xs">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-border hidden md:block" />
              <div className="flex items-center gap-2">
                {event.isOnline ? <Globe className="h-5 w-5 shrink-0" /> : <MapPin className="h-5 w-5 shrink-0" />}
                <div>
                  <p className="font-medium text-foreground">{event.isOnline ? "Online Event" : "Location"}</p>
                  <p className="text-xs truncate max-w-[200px]">{event.isOnline && !event.location ? "Link provided upon registration" : event.location}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            {event.registrationUrl && (
              <a 
                href={event.registrationUrl} 
                target="_blank" 
                rel="noreferrer"
                className={buttonVariants({ size: "lg", className: "flex-1 sm:flex-none" })}
              >
                Register Now <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            )}
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1 sm:flex-none"
              onClick={handleBookmarkToggle}
              disabled={isProcessingBookmark}
            >
              {isProcessingBookmark ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bookmark className={`mr-2 h-4 w-4 ${event.isBookmarked ? "fill-primary text-primary" : ""}`} />
              )}
              {event.isBookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="flex-1 sm:flex-none"
              onClick={handleAddToCalendar}
            >
              <Download className="mr-2 h-4 w-4" />
              Add to Calendar
            </Button>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-xl font-bold mb-4">About this Event</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {event.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
