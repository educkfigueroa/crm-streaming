import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { SidebarProvider } from "@/components/shared/SidebarContext";
import { SwipeSidebar } from "@/components/shared/SwipeSidebar";
import { ChatAssistant } from "@/components/ai/ChatAssistant";
import { ViewTransition } from "react";
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
      <SwipeSidebar>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 pb-28 sm:pb-20 lg:pb-14 scrollable">
              <ViewTransition
                enter={{
                  "nav-forward": "nav-forward",
                  "nav-back": "nav-back",
                  default: "none",
                }}
                exit={{
                  "nav-forward": "nav-forward",
                  "nav-back": "nav-back",
                  default: "none",
                }}
                default="none"
              >
                {children}
              </ViewTransition>
            </main>
          </div>
        </div>
      </SwipeSidebar>
      <ChatAssistant />
    </SidebarProvider>
  );
}
