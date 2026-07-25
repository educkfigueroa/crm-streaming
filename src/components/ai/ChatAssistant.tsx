"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1 rounded-md hover:bg-accent transition-colors"
      title="Copiar"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  );
}

function getMessageText(msg: {
  role: string;
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (msg.content) return msg.content;
  if (msg.parts) {
    return msg.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text || "")
      .join("");
  }
  return "";
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("---")) {
          return (
            <div key={i} className="border-t border-border/50 my-2" />
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    console.log("[chat-client] status:", status, "messages:", messages.length);
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      console.log("[chat-client] last msg:", last.role, JSON.stringify(last.parts?.slice(0, 3)));
    }
  }, [status, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const sendSuggestion = (text: string) => {
    sendMessage({ text });
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group ${
          open
            ? "bg-red-500/90 hover:bg-red-500 rotate-0"
            : "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 hover:scale-110 hover:shadow-emerald-500/25"
        }`}
      >
        {open ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Sparkles className="h-5 w-5 text-white group-hover:animate-pulse" />
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl border border-border/50 bg-card/95 backdrop-blur-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">
                Asistente CRM
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {isLoading ? "Pensando..." : "En línea"}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  ¡Hola! Soy tu asistente CRM
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Pregúntame sobre tus suscripciones, clientes o cuentas
                </p>
                <div className="space-y-2 w-full max-w-xs">
                  {[
                    "¿Cuántas suscripciones activas tengo?",
                    "¿Quiénes vencen esta semana?",
                    "Envía credenciales de Juan García",
                    "¿Cuánto generé este mes?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendSuggestion(q)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border/50 bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const text = getMessageText(msg);
              if (!text && msg.role === "assistant") return null;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-emerald-500" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent/80 text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="relative group">
                        <MessageContent content={text} />
                        {text && (
                          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={text} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm">{text}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading &&
              messages.length > 0 &&
              messages[messages.length - 1].role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3 w-3 text-emerald-500" />
                  </div>
                  <div className="bg-accent/80 rounded-xl px-3 py-2">
                    <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                  </div>
                </div>
              )}

            {error && (
              <div className="text-center text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                Error: {error.message}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3 border-t border-border/50"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              className="flex-1 bg-accent/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="h-9 w-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
