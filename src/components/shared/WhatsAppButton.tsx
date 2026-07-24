"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  className?: string;
  label?: string;
}

export function WhatsAppButton({ phone, message, className, label }: WhatsAppButtonProps) {
  const url = getWhatsAppUrl(phone, message);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 text-green-400 hover:text-green-300", className)}
      render={
        <a href={url} target="_blank" rel="noopener noreferrer" title={label || "Enviar por WhatsApp"} />
      }
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  );
}
