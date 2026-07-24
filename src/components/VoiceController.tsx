import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  autoPlay?: boolean;
  onEnd?: () => void;
};

// Minimal PCM SSE player for /api/coach/tts
export function VoiceController({ text, autoPlay = true, onEnd }: Props) {
  const [enabled, setEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (endTimerRef.current) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    if (mountedRef.current) setPlaying(false);
  }, []);

  const play = useCallback(
    async (t: string) => {
      if (!enabled || !t.trim()) return;
      stop();
      setPlaying(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioCtx({ sampleRate: 24000 });
        ctxRef.current = ctx;
        if (ctx.state === "suspended") await ctx.resume().catch(() => {});
        let playhead = 0;
        let pending = new Uint8Array(0);

        const playChunk = (incoming: Uint8Array) => {
          const bytes = new Uint8Array(pending.length + incoming.length);
          bytes.set(pending);
          bytes.set(incoming, pending.length);
          const usable = bytes.length - (bytes.length % 2);
          pending = bytes.slice(usable);
          if (usable === 0) return;
          const samples = new Int16Array(bytes.buffer, 0, usable / 2);
          const floats = Float32Array.from(samples, (s) => s / 32768);
          const buf = ctx.createBuffer(1, floats.length, 24000);
          buf.copyToChannel(floats, 0);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          if (playhead === 0) playhead = ctx.currentTime + 0.05;
          else playhead = Math.max(playhead, ctx.currentTime);
          src.start(playhead);
          playhead += buf.duration;
        };

        const res = await fetch("/api/coach/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: t }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          setPlaying(false);
          return;
        }

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          let idx: number;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const evt = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const line = evt
              .split("\n")
              .find((l) => l.startsWith("data:"));
            if (!line) continue;
            const dataStr = line.slice(5).trim();
            if (!dataStr) continue;
            try {
              const payload = JSON.parse(dataStr) as {
                type: string;
                audio?: string;
              };
              if (payload.type === "speech.audio.delta" && payload.audio) {
                const bin = atob(payload.audio);
                const bytes = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                playChunk(bytes);
              }
            } catch {
              // ignore
            }
          }
        }
        // wait roughly for playback
        const remaining = Math.max(0, playhead - ctx.currentTime);
        setTimeout(() => {
          setPlaying(false);
          onEnd?.();
        }, remaining * 1000);
      } catch {
        setPlaying(false);
      }
    },
    [enabled, onEnd, stop],
  );

  useEffect(() => {
    if (autoPlay && enabled && text) {
      // small delay to let UI settle
      const id = setTimeout(() => play(text), 250);
      return () => {
        clearTimeout(id);
        stop();
      };
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoPlay]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          if (enabled) stop();
          setEnabled((e) => !e);
        }}
        aria-label={enabled ? "Silenciar voz" : "Ativar voz"}
        className="grid h-10 w-10 place-items-center rounded-full bg-surface-elevated text-foreground active:scale-95"
      >
        {enabled ? (
          <Volume2 className={`h-5 w-5 ${playing ? "text-primary" : ""}`} />
        ) : (
          <VolumeX className="h-5 w-5 text-text-tertiary" />
        )}
      </button>
      <button
        onClick={() => play(text)}
        aria-label="Repetir instrução"
        className="grid h-10 w-10 place-items-center rounded-full bg-surface-elevated text-foreground active:scale-95"
      >
        <RotateCcw className="h-5 w-5" />
      </button>
    </div>
  );
}
