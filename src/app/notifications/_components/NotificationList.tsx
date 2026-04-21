"use client";

import Link from "next/link";
import { useTransition } from "react";
import { markAsRead } from "@/lib/actions/notification";
import { formatDate } from "@/lib/utils/date";
import { NotificationType } from "@prisma/client";

const TYPE_LABEL: Record<NotificationType, string> = {
  COMMENT_ON_MY_POST: "댓글",
  REPLY_TO_MY_COMMENT: "답글",
  KEYWORD_MATCH: "키워드",
  NICKNAME_CHANGED: "닉네임",
};

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string;
  isRead: boolean;
  createdAt: Date;
  actor: { nickname: string | null; publicId: string };
};

export default function NotificationList({ notifications }: { notifications: Notification[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </ul>
  );
}

function NotificationItem({ notification: n }: { notification: Notification }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (n.isRead) return;
    startTransition(async () => {
      await markAsRead(n.id);
    });
  }

  return (
    <li>
      <Link
        href={n.link}
        onClick={handleClick}
        className={`flex flex-col gap-1 px-4 py-3 rounded-xl border transition-colors hover:bg-muted ${
          n.isRead
            ? "bg-card border-border-base opacity-60"
            : "bg-card border-primary-base/30"
        } ${isPending ? "opacity-50" : ""}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {!n.isRead && (
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
              {TYPE_LABEL[n.type]}
            </span>
            <span className="text-sm font-medium truncate">{n.title}</span>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{formatDate(n.createdAt)}</span>
        </div>
        {n.body && (
          <p className="text-xs text-muted-foreground truncate pl-4">{n.body}</p>
        )}
      </Link>
    </li>
  );
}
