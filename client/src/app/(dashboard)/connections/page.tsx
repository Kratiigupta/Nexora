"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  connectionService,
  type ConnectionListItem,
  type AllConnectionsResponse,
} from "@/lib/services/connection.service";
import { chatService } from "@/lib/services/chat.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import {
  Users2,
  UserPlus,
  UserMinus,
  MessageSquare,
  Clock,
  X,
  Loader2,
  ArrowUpRight,
  Inbox,
  Send,
  Check,
} from "lucide-react";

/**
 * ConnectionCard — displays a single connection item with actions.
 * Extracted as a standalone component to satisfy react-hooks/static-components.
 */
function ConnectionCard({
  item,
  loading,
  actions,
}: {
  item: ConnectionListItem;
  loading: boolean;
  actions: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-4 flex items-center gap-4">
        <Link href={`/profile/${item.user.username}`} className="shrink-0">
          <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
            <AvatarImage src={item.user.avatarUrl || undefined} />
            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
              {getInitials(item.user.fullName)}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${item.user.username}`}
            className="font-semibold text-sm hover:underline truncate block"
          >
            {item.user.fullName}
          </Link>
          <p className="text-xs text-muted-foreground truncate">
            @{item.user.username}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {item.user.department && (
              <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                {item.user.department}
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(item.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            actions
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * EmptyState — shown when a tab has no items.
 */
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-card/50 border rounded-xl border-dashed">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      <Link href="/discover/students">
        <Button variant="outline" className="mt-5 gap-2">
          <UserPlus className="h-4 w-4" />
          Discover Students
        </Button>
      </Link>
    </div>
  );
}

/**
 * SkeletonCards — loading placeholder for connection lists.
 */
function SkeletonCards() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Connections dashboard — view and manage all connections.
 * Tabs: Connected, Incoming Requests, Outgoing Requests.
 */
export default function ConnectionsPage() {
  const router = useRouter();
  const [data, setData] = useState<AllConnectionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await connectionService.getAllConnections();
      setData(result);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Failed to load connections.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchConnections();
  }, [fetchConnections]);

  const setItemLoading = (userId: string, loading: boolean) => {
    setActionLoading((prev) => ({ ...prev, [userId]: loading }));
  };

  const handleAccept = async (item: ConnectionListItem) => {
    setItemLoading(item.user.id, true);
    try {
      await connectionService.updateConnectionStatus(item.user.id, "accepted");
      toast.success(`Connected with ${item.user.fullName}`);
      // Move from incoming to connections
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          incomingRequests: prev.incomingRequests.filter((r) => r.id !== item.id),
          connections: [{ ...item, status: "accepted" }, ...prev.connections],
        };
      });
    } catch {
      toast.error("Failed to accept request");
    } finally {
      setItemLoading(item.user.id, false);
    }
  };

  const handleReject = async (item: ConnectionListItem) => {
    setItemLoading(item.user.id, true);
    try {
      await connectionService.updateConnectionStatus(item.user.id, "rejected");
      toast.success("Request rejected");
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          incomingRequests: prev.incomingRequests.filter((r) => r.id !== item.id),
        };
      });
    } catch {
      toast.error("Failed to reject request");
    } finally {
      setItemLoading(item.user.id, false);
    }
  };

  const handleCancel = async (item: ConnectionListItem) => {
    setItemLoading(item.user.id, true);
    try {
      await connectionService.removeConnection(item.user.id);
      toast.success("Request cancelled");
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          outgoingRequests: prev.outgoingRequests.filter((r) => r.id !== item.id),
        };
      });
    } catch {
      toast.error("Failed to cancel request");
    } finally {
      setItemLoading(item.user.id, false);
    }
  };

  const handleDisconnect = async (item: ConnectionListItem) => {
    setItemLoading(item.user.id, true);
    try {
      await connectionService.removeConnection(item.user.id);
      toast.success(`Disconnected from ${item.user.fullName}`);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          connections: prev.connections.filter((c) => c.id !== item.id),
        };
      });
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setItemLoading(item.user.id, false);
    }
  };

  const handleMessage = async (item: ConnectionListItem) => {
    setItemLoading(item.user.id, true);
    try {
      const conversation = await chatService.createConversation({
        type: "direct",
        participantId: item.user.id,
      });
      router.push(`/messages?conversation=${conversation.id}`);
    } catch {
      toast.error("Failed to open conversation");
      setItemLoading(item.user.id, false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Connections</h2>
        <p className="text-muted-foreground mt-1">
          Manage your network and connection requests.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-between">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchConnections}>
            Retry
          </Button>
        </div>
      )}

      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="connections" className="gap-1.5 text-xs sm:text-sm">
            <Users2 className="h-3.5 w-3.5 hidden sm:inline-block" />
            Connected
            {data && data.connections.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {data.connections.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="incoming" className="gap-1.5 text-xs sm:text-sm">
            <Inbox className="h-3.5 w-3.5 hidden sm:inline-block" />
            Incoming
            {data && data.incomingRequests.length > 0 && (
              <Badge className="ml-1 text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
                {data.incomingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="gap-1.5 text-xs sm:text-sm">
            <Send className="h-3.5 w-3.5 hidden sm:inline-block" />
            Outgoing
            {data && data.outgoingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {data.outgoingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Connected Tab */}
        <TabsContent value="connections" className="mt-6">
          {isLoading ? (
            <SkeletonCards />
          ) : data && data.connections.length > 0 ? (
            <div className="space-y-3">
              {data.connections.map((item) => (
                <ConnectionCard
                  key={item.id}
                  item={item}
                  loading={actionLoading[item.user.id] || false}
                  actions={
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleMessage(item)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Message</span>
                      </Button>
                      <Link href={`/profile/${item.user.username}`}>
                        <Button variant="ghost" size="sm" className="gap-1.5">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Profile</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive gap-1.5"
                        onClick={() => handleDisconnect(item)}
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Disconnect</span>
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users2}
              title="No connections yet"
              description="Start connecting with other students to build your network."
            />
          )}
        </TabsContent>

        {/* Incoming Requests Tab */}
        <TabsContent value="incoming" className="mt-6">
          {isLoading ? (
            <SkeletonCards />
          ) : data && data.incomingRequests.length > 0 ? (
            <div className="space-y-3">
              {data.incomingRequests.map((item) => (
                <ConnectionCard
                  key={item.id}
                  item={item}
                  loading={actionLoading[item.user.id] || false}
                  actions={
                    <>
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleAccept(item)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Accept</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => handleReject(item)}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No incoming requests"
              description="When someone sends you a connection request, it will appear here."
            />
          )}
        </TabsContent>

        {/* Outgoing Requests Tab */}
        <TabsContent value="outgoing" className="mt-6">
          {isLoading ? (
            <SkeletonCards />
          ) : data && data.outgoingRequests.length > 0 ? (
            <div className="space-y-3">
              {data.outgoingRequests.map((item) => (
                <ConnectionCard
                  key={item.id}
                  item={item}
                  loading={actionLoading[item.user.id] || false}
                  actions={
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleCancel(item)}
                    >
                      <X className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Send}
              title="No outgoing requests"
              description="Connection requests you send will appear here until they are accepted."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
