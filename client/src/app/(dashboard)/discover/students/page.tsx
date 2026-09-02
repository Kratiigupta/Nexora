"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, UserPlus, Users, GraduationCap, Star } from "lucide-react";
import { profileService } from "@/lib/services/profile.service";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TeammateRecommendation } from "@/types/dashboard";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

export default function DiscoverStudentsPage() {
  const [students, setStudents] = useState<TeammateRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // The backend returns recommended teammates based on a scoring algorithm
      const data = await profileService.getRecommendedTeammates();
      setStudents(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Failed to load students.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  // Client-side filtering for the search input since the endpoint doesn't accept a search query yet
  const filteredStudents = students.filter(student => 
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
    student.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Discover Students</h2>
          <p className="text-muted-foreground mt-1">
            Find potential teammates and collaborators based on your skills and interests.
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-center max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by name, skill, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-between">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>Retry</Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-5 flex flex-col items-center text-center space-y-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2 w-full flex flex-col items-center">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="w-full space-y-2 py-2 border-y">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                </div>
                <div className="flex gap-2 w-full pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="overflow-hidden border shadow-sm flex flex-col h-full hover:shadow-md transition-all group">
              <CardContent className="p-5 flex flex-col items-center text-center flex-1">
                <div className="relative mb-3">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                    <AvatarImage src={student.avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                      {getInitials(student.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm border">
                    <div className="bg-green-500 h-3 w-3 rounded-full" title="Available for team" />
                  </div>
                </div>
                
                <h3 className="font-bold text-lg leading-tight truncate w-full">{student.fullName}</h3>
                <p className="text-sm text-muted-foreground truncate w-full mb-3">@{student.username}</p>

                {student.department && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-4 bg-muted/50 py-1 px-2 rounded-md w-full truncate">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{student.department} {student.year ? `• Year ${student.year}` : ''}</span>
                  </div>
                )}

                {student.matchReasons && student.matchReasons.length > 0 && (
                  <div className="flex items-center justify-center gap-1 text-xs text-primary/80 bg-primary/10 py-1 px-2 rounded-full w-fit mb-4 mx-auto">
                    <Star className="h-3 w-3 fill-primary/80" />
                    <span>{student.matchReasons[0]}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1.5 justify-center mt-auto mb-5 w-full">
                  {student.skills.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                      {skill}
                    </Badge>
                  ))}
                  {student.skills.length > 3 && (
                    <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 text-muted-foreground">
                      +{student.skills.length - 3}
                    </Badge>
                  )}
                  {student.skills.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No skills listed</span>
                  )}
                </div>

                <div className="flex gap-2 w-full mt-auto">
                  <Link 
                    href={`/profile/${student.username}`}
                    className={`flex-1 ${buttonVariants({ variant: "default" })}`}
                  >
                    View Profile
                  </Link>
                  <Button variant="outline" size="icon" title="Connect">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/50 border rounded-xl border-dashed">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No students found</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            {searchQuery 
              ? "No students match your filter criteria. Try adjusting your search."
              : "We couldn't find any recommended teammates at the moment. Update your profile skills to get better matches."}
          </p>
          {searchQuery && (
            <Button variant="outline" className="mt-6" onClick={() => setSearchQuery("")}>
              Clear filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
