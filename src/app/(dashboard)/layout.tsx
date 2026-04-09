import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="lg:pl-[260px]">
        {children}
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
