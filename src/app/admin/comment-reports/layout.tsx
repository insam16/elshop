export default function AdminCommentReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative left-1/2 -translate-x-1/2 w-screen max-w-[1800px] px-4">
      {children}
    </div>
  );
}
