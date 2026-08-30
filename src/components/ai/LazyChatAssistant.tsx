"use client";

import dynamic from "next/dynamic";

const ChatAssistant = dynamic(
  () => import("@/components/ai/ChatAssistant").then((m) => m.ChatAssistant),
  { ssr: false }
);

export function LazyChatAssistant() {
  return <ChatAssistant />;
}
