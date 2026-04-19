import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getNotifications } from "@/lib/notifications";
import { markAllAsRead } from "@/lib/actions/notification";
import NotificationList from "./_components/NotificationList";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const notifications = await getNotifications(session.user.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">알림</h1>
        {notifications.some((n) => !n.isRead) && (
          <form action={markAllAsRead}>
            <button
              type="submit"
              className="text-xs text-muted-foreground hover:text-primary-base transition-colors"
            >
              모두 읽음
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-16">알림이 없습니다.</p>
      ) : (
        <NotificationList notifications={notifications} />
      )}
    </div>
  );
}
