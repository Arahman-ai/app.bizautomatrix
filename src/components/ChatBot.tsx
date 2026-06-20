"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const HIDDEN_PATH_PREFIXES = ["/admin", "/dashboard", "/studio"];

export default function ChatBot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I am the BizAutomatrix AI assistant. Ask me about Digital Marketing, Software & AI, Engineering services, pricing, or how to start with a free audit.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const shouldHide = HIDDEN_PATH_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  if (shouldHide) return null;

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      const reply =
        data.reply ||
        "I can help with website upgrades, SEO, review automation, AI agents, and business workflows. Email info@bizautomatrix.com to start.";

      setMessages((current) => [...current, { role: "assistant", content: reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Connection issue. Please email info@bizautomatrix.com or WhatsApp +1 (404) 203-7674.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Chat with BizAutomatrix"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-[0_16px_40px_rgba(249,115,22,0.35)] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
        )}
      </button>

      {open && (
        <section className="fixed bottom-24 right-5 z-50 flex h-[min(560px,calc(100vh-120px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl">
          <header className="flex items-center justify-between bg-gradient-to-br from-orange-400 to-rose-500 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8V4" />
                  <rect x="5" y="8" width="14" height="10" rx="3" />
                  <path d="M9 12h.01" />
                  <path d="M15 12h.01" />
                  <path d="M9 16h6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">BizAutomatrix AI</p>
                <p className="text-xs text-white/75">Typically replies instantly</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 text-white/90 transition hover:bg-white/15"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[84%] rounded-2xl rounded-br-md bg-gradient-to-br from-orange-400 to-rose-500 px-4 py-3 text-sm leading-relaxed text-white"
                    : "mr-auto max-w-[84%] rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-sm leading-relaxed text-slate-100"
                }
              >
                {message.content}
              </div>
            ))}
            {sending && (
              <div className="mr-auto max-w-[84%] rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-sm text-slate-300">
                Thinking...
              </div>
            )}
          </div>

          <form
            className="flex gap-2 border-t border-white/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask anything..."
              style={{ color: "#fff", WebkitTextFillColor: "#fff" }}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-orange-300"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="flex h-11 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>
        </section>
      )}
    </>
  );
}
