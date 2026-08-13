import React from "react";
import { Message } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isOwnMessage, showAvatar = true }: MessageBubbleProps) {
  const isSystem = message.type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full text-center max-w-[80%]">
          {message.content}
        </span>
      </div>
    );
  }

  const senderName = message.sender?.fullName || "Unknown User";
  const avatarInitials = senderName.substring(0, 2).toUpperCase();

  return (
    <div className={cn("flex w-full mb-4 gap-3", isOwnMessage ? "justify-end" : "justify-start")}>
      {!isOwnMessage && showAvatar && (
        <Avatar className="h-8 w-8 shrink-0 mt-auto">
          <AvatarImage src={message.sender?.avatarUrl || undefined} />
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
            {avatarInitials}
          </AvatarFallback>
        </Avatar>
      )}
      
      {!isOwnMessage && !showAvatar && <div className="w-8 shrink-0" />}

      <div className={cn("flex flex-col max-w-[75%]", isOwnMessage ? "items-end" : "items-start")}>
        <div 
          className={cn(
            "px-4 py-2 rounded-2xl text-sm break-words",
            isOwnMessage 
              ? "bg-primary text-primary-foreground rounded-br-sm" 
              : "bg-muted text-foreground rounded-bl-sm border"
          )}
        >
          {message.type === "image" && message.fileUrl ? (
            <div className="flex flex-col gap-2">
              <img 
                src={message.fileUrl} 
                alt="Uploaded content" 
                className="max-w-full rounded-lg max-h-64 object-cover" 
              />
              {message.content && <span>{message.content}</span>}
            </div>
          ) : message.type === "file" && message.fileUrl ? (
            <div className="flex flex-col gap-2">
              <a 
                href={message.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-medium hover:text-primary/80"
              >
                Attachment
              </a>
              {message.content && <span>{message.content}</span>}
            </div>
          ) : (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>
        
        <span className="text-[10px] text-muted-foreground mt-1 mx-1">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
