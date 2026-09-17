"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eventService, type CreateEventInput } from "@/lib/services/event.service";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateEventInput>({
    title: "",
    description: "",
    type: "hackathon",
    organizer: "",
    bannerUrl: "",
    location: "",
    isOnline: false,
    registrationUrl: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsSubmitting(true);
    try {
      const newEvent = await eventService.createEvent(formData);
      toast.success("Event created successfully");
      router.push(`/events/${newEvent.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Event</h2>
          <p className="text-muted-foreground">Host a hackathon, meetup, or workshop for the community.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Provide all the information attendees need to know.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Event Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Winter Web3 Hackathon"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your event..."
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Event Type <span className="text-destructive">*</span></Label>
                <select
                  id="type"
                  name="type"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="hackathon">Hackathon</option>
                  <option value="workshop">Workshop</option>
                  <option value="meetup">Meetup</option>
                  <option value="webinar">Webinar</option>
                  <option value="competition">Competition</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizer">Organizer (Optional)</Label>
                <Input
                  id="organizer"
                  name="organizer"
                  placeholder="e.g. Nexora Community"
                  value={formData.organizer}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date & Time <span className="text-destructive">*</span></Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time <span className="text-destructive">*</span></Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOnline"
                    name="isOnline"
                    checked={formData.isOnline}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isOnline" className="cursor-pointer">This is an online event</Label>
                </div>
              </div>

              {!formData.isOnline && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. 123 Tech Hub, San Francisco, CA"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="registrationUrl">External Registration URL (Optional)</Label>
                <Input
                  id="registrationUrl"
                  name="registrationUrl"
                  type="url"
                  placeholder="e.g. https://lu.ma/event"
                  value={formData.registrationUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bannerUrl">Optional Banner URL</Label>
                <Input
                  id="bannerUrl"
                  name="bannerUrl"
                  type="url"
                  placeholder="e.g. https://example.com/banner.jpg"
                  value={formData.bannerUrl}
                  onChange={handleChange}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Must be a valid URL to an image.
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href="/events" className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
