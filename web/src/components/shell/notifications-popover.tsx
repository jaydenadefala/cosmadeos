"use client";

import Link from "next/link";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  clearAllNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/lib/mock-data/notifications";

/**
 * Notification Center (shell) — 06 Platform Core/app-shell.md.
 * Real mock data model wired (web/src/lib/mock-data/notifications.ts),
 * replacing the prior permanent empty state.
 */
export function NotificationsPopover() {
  const notifications = useNotifications();
  const unreadCount = useUnreadNotificationCount();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"
            }
            className="text-muted-foreground hover:text-foreground relative"
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="bg-primary absolute top-1.5 right-1.5 size-1.5 rounded-full" />
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">
            Notifications
            {unreadCount > 0 ? (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} new
              </Badge>
            ) : null}
          </p>
          {notifications.length > 0 ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Mark all as read"
                onClick={markAllNotificationsRead}
              >
                <CheckCheck className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Clear all notifications"
                onClick={clearAllNotifications}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ) : null}
        </div>
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="Approvals, mentions, and reminders will show up here."
          />
        ) : (
          <ul className="max-h-96 overflow-auto">
            {notifications.map((n) => (
              <li key={n.id} className="border-b last:border-b-0">
                <Link
                  href={n.href}
                  onClick={() => !n.read && markNotificationRead(n.id)}
                  className={cn(
                    "hover:bg-accent flex items-start gap-2 px-4 py-3 text-left transition-colors",
                    !n.read && "bg-accent/40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      !n.read ? "bg-primary" : "bg-transparent",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{n.title}</span>
                      {!n.read ? (
                        <Check
                          className="text-muted-foreground hover:text-foreground size-3.5 shrink-0"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markNotificationRead(n.id);
                          }}
                        />
                      ) : null}
                    </span>
                    <span className="text-muted-foreground line-clamp-2 text-xs">
                      {n.description}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-[10px] uppercase tracking-wide">
                      {n.createdLabel}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
