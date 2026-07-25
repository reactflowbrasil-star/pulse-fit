/**
 * Validação de variáveis de ambiente no startup do servidor.
 * Loga quais estão faltando, mas NÃO bloqueia a inicialização
 * (apenas produz warnings para facilitar o debug).
 */

type EnvCheck = {
  key: string;
  required: boolean;
  description: string;
};

const ENV_CHECKS: EnvCheck[] = [
  // Supabase (obrigatórias)
  { key: "SUPABASE_URL", required: true, description: "URL do projeto Supabase" },
  { key: "SUPABASE_ANON_KEY", required: true, description: "Chave anon do Supabase" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", required: false, description: "Chave service_role (necessária para operações admin e webhook)" },

  // Auth (obrigatórias para funcionalidade)
  { key: "SUPABASE_PUBLISHABLE_KEY", required: true, description: "Chave publishable do Supabase (auth middleware)" },

  // WhatsApp (opcionais, mas necessárias para envio de mensagens)
  { key: "EVOLUTION_API_URL", required: false, description: "URL da Evolution API para envio/recebimento de mensagens" },
  { key: "EVOLUTION_API_KEY", required: false, description: "API Key da Evolution API" },
  { key: "EVOLUTION_INSTANCE", required: false, description: "Nome da instância na Evolution API" },
  { key: "WHATSAPP_WEBHOOK_TOKEN", required: false, description: "Token para autenticar webhooks recebidos" },

  // Bot externo (fallback)
  { key: "BOT_URL", required: false, description: "URL do bot server externo (fallback para envio de código)" },
  { key: "BOT_TOKEN", required: false, description: "Token do bot server externo" },

  // AI
  { key: "LOVABLE_API_KEY", required: false, description: "Chave do Lovable AI Gateway (coach virtual)" },
];

export function validateEnvironment(): void {
  const missing: { key: string; description: string }[] = [];
  const warnings: { key: string; description: string }[] = [];

  for (const check of ENV_CHECKS) {
    const value = process.env[check.key];
    if (!value || value.trim() === "") {
      if (check.required) {
        missing.push({ key: check.key, description: check.description });
      } else {
        warnings.push({ key: check.key, description: check.description });
      }
    }
  }

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║  🚀 Pulse Fit — Validação de Ambiente        ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  if (missing.length > 0) {
    console.log("❌ VARIÁVEIS OBRIGATÓRIAS FALTANDO:");
    for (const m of missing) {
      console.log(`   • ${m.key} — ${m.description}`);
    }
    console.log("");
  } else {
    console.log("✅ Todas as variáveis obrigatórias estão definidas.\n");
  }

  if (warnings.length > 0) {
    console.log("⚠️  Variáveis opcionais não configuradas:");
    for (const w of warnings) {
      console.log(`   • ${w.key} — ${w.description}`);
    }
    console.log("");
  }

  // Diagnóstico do WhatsApp
  const hasEvolution = Boolean(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY && process.env.EVOLUTION_INSTANCE);
  const hasBot = Boolean(process.env.BOT_URL);
  const hasWebhook = Boolean(process.env.WHATSAPP_WEBHOOK_TOKEN);

  console.log("📱 WhatsApp:");
  console.log(`   Evolution API: ${hasEvolution ? "✅ Configurada" : "❌ Não configurada"}`);
  console.log(`   Bot externo:   ${hasBot ? "✅ Configurado" : "⚠️  Não configurado"}`);
  console.log(`   Webhook token: ${hasWebhook ? "✅ Definido" : "⚠️  Não definido"}`);

  if (!hasEvolution && !hasBot) {
    console.log("\n   💡 Para configurar, acesse /admin/whatsapp-integration");
    console.log("   ou edite o arquivo .env com as credenciais da Evolution API.\n");
  } else {
    console.log("");
  }
}
