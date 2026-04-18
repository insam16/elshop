import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-border-base flex items-center gap-3">
        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">
          ADMIN
        </span>
        <span className="text-sm text-muted-foreground">
          {session.user.nickname ?? "?"}
        </span>
      </div>
      {children}
    </div>
  );
}
