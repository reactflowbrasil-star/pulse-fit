import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bot/health")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            ok: true,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            service: "pulse-fit-app",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          },
        );
      },
    },
  },
});
