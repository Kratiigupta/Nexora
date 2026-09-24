"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, Check, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/lib/services/ai.service";
import type { AiMatchInsight } from "@/types/ai";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AiMatchInsightProps {
  candidateId: string;
  candidateName: string;
}

export function AiMatchInsightButton({ candidateId }: AiMatchInsightProps) {
  const [insight, setInsight] = useState<AiMatchInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async () => {
    if (insight) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsExpanded(true);
    
    try {
      const data = await aiService.getMatchInsight(candidateId);
      setInsight(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "AI insight unavailable right now.");
      toast.error("Failed to generate AI insight");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={fetchInsight}
        disabled={isLoading}
        className={cn(
          "w-full flex items-center justify-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all",
          insight && "text-muted-foreground hover:text-foreground"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3 fill-current" />
        )}
        {insight ? (isExpanded ? "Hide Insight" : "View Insight") : "Generate AI Insight"}
        {insight && (isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-3 mt-2 text-left">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2 text-indigo-400">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  <p className="text-xs">Analyzing compatibility...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-3 space-y-2">
                  <p className="text-xs text-destructive text-center">{error}</p>
                  <Button variant="outline" size="sm" onClick={fetchInsight} className="h-7 text-xs">
                    Retry
                  </Button>
                </div>
              ) : insight ? (
                <div className="space-y-3">
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {insight.summary}
                  </p>
                  
                  {insight.sharedSkills.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" /> Shared Skills
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {insight.sharedSkills.map(skill => (
                          <Badge key={skill} variant="secondary" className="text-[9px] px-1.5 py-0 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {insight.complementarySkills.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-indigo-400" /> Complementary
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {insight.complementarySkills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-[9px] px-1.5 py-0 border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {insight.collaborationIdeas.length > 0 && (
                    <div className="bg-background/50 rounded p-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Lightbulb className="h-3 w-3 text-amber-500" /> Ideas
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        {insight.collaborationIdeas.map((idea, idx) => (
                          <li key={idx} className="line-clamp-2" title={idea}>{idea}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <p className="text-[9px] text-muted-foreground/60 text-center italic mt-2">
                    Collaboration suggestion based on profile info. AI can make mistakes.
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
