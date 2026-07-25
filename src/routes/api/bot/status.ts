import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bot/status")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { readEvolutionEnv, evolutionFetch } = await import("@/lib/evolution.server");
          const env = readEvolutionEnv();

          if (!env) {
            return json({
              ok: false,
              configured: false,
              connectionState: "unknown",
              error: "Evolution API não configurada",
              phone: null,
              name: null,
            });
          }

          const info = (await evolutionFetch(env, `/instance/connectionState/${encodeURIComponent(env.instance)}`, {
            method: "GET",
          })) as { instance?: { state?: string; owner?: string } } | null;

          return json({
            ok: true,
            configured: true,
            connectionState: info?.instance?.state ?? "unknown",
            phone: info?.instance?.owner?.split(":")[0] || null,
            name: null,
            qrAvailable: false,
            uptime: 0,
            error: null,
          });
        } catch (err) {
          return json({
            ok: false,
            configured: true,
            connectionState: "error",
            error: err instanceof Error ? err.message : "Erro ao consultar status",
            phone: null,
            name: null,
          });
        }
      },
    },
  },
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
