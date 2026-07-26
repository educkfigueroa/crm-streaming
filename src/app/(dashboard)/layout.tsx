import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { SidebarProvider } from "@/components/shared/SidebarContext";
import { ChatAssistant } from "@/components/ai/ChatAssistant";
import { ServiceWorkerRegistrar } from "@/components/notifications/ServiceWorkerRegistrar";
import { PushPermissionDialog } from "@/components/notifications/PushPermissionDialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ServiceWorkerRegistrar />
      <PushPermissionDialog />
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 pb-24 sm:pb-16 lg:pb-12 scrollable">
            {children}
          </main>
        </div>
      </div>
      <ChatAssistant />
    </SidebarProvider>
  );
}
