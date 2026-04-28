import { ToastProvider } from "@/components/ToastProvider";
import { BottomNav } from "@/components/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex-1 overflow-hidden relative w-full h-full">
        {children}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
