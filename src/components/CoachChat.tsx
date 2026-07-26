/**
 * CoachChat — reusable chat component for trainer conversations.
 * Features: message bubbles, typing indicator, voice TTS, stagger animations.
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceController } from "@/components/VoiceController";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type CoachChatProps = {
  trainerName: string;
  trainerEmoji: string;
  accentColor?: string;
  initialMessages?: ChatMessage[];
  onSendMessage?: (message: string, existingMessages: ChatMessage[]) => Promise<string>;
  placeholder?: string;
  showVoice?: boolean;
  maxHeight?: string;
};

export function CoachChat({
  trainerName,
  trainerEmoji,
  accentColor = "text-primary",
  initialMessages = [],
  onSendMessage,
  placeholder = "Digite sua mensagem...",
  showVoice = true,
  maxHeight = "calc(100dvh - 280px)",
}: CoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !onSendMessage) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await onSendMessage(text, messages);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Desculpe, tive um problema de conexão. Pode repetir?",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, onSendMessage]);

  return (
    <div className="flex flex-1 flex-col" style={{ maxHeight }}>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm">
                  {trainerEmoji}
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-surface-card border border-border/60 text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
                {showVoice && msg.role === "assistant" && (
                  <div className="mt-2">
                    <VoiceController text={msg.content} autoPlay={false} />
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="ml-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  EU
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm">
              {trainerEmoji}
            </div>
            <div className="rounded-2xl rounded-bl-md bg-surface-card border border-border/60 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border/30 bg-surface-card/50 backdrop-blur-sm">
        <input
          ref={inputRef}
          className="flex-1 rounded-2xl bg-surface-elevated border border-border px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 placeholder:text-text-muted transition-all"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
        />
        <Button
          variant="primary"
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          loading={loading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
