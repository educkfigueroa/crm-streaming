"use client";

import { useRouter } from "next/navigation";
import { PullToRefresh } from "@/components/shared/PullToRefresh";

export function SubscriptionsRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleRefresh = async () => {
    router.refresh();
    await new Promise((r) => setTimeout(r, 500));
  };

  return <PullToRefresh onRefresh={handleRefresh}>{children}</PullToRefresh>;
}
