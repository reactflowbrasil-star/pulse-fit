# Plano — Pulse Fit “Premium Fitness AI” (execução por fases)

O app já tem 80% do que você pediu (splash, Coach IA, Trainer 3D procedural, VoiceController TTS, sessão de treino com dor/substituir/pausar, catálogo `exercise_catalog` no Supabase, WhatsApp). Não vou reconstruir isso — vou **realinhar visual à imagem**, criar as rotas faltantes e completar as tabelas necessárias, respeitando sua ordem: Fase 1 primeiro, avança nas seguintes só depois de você validar.

## Análise do que já existe (reaproveitar)

| Já pronto | Onde | Ação |
|---|---|---|
| Splash animada 2.4s com anel + logo respirando | `src/routes/splash.tsx`, `AnimatedLogo.tsx` | Ajustar frase e timing p/ 2.5s; usar como boot real |
| Dashboard (passos, calorias, água, treinos, header) | `src/routes/index.tsx` + `dashboard`/`user` em `mock.ts` | Realinhar cores/tipos à referência; adicionar contagem animada + anéis SVG |
| BottomNav com FAB central | `src/components/BottomNav.tsx` | Renomear itens: Início / Dieta / Treinador IA / Progresso / Suporte |
| Coach IA (onboarding + geração de plano via GPT-5.5 com Zod whitelist) | `src/routes/coach.tsx`, `src/lib/coach.functions.ts` | Reaproveitar como `/ai-trainer` (alias de rota) |
| Trainer 3D procedural + presets de câmera + pausa | `src/components/Trainer3DViewer.tsx` | Estender props (`trainerState`, `qualityLevel`, `isSpeaking`, `onLoaded/onError`) e adicionar arquitetura p/ modelo GLB opcional |
| Sessão de treino guiada (idx, pausa, dor, substituir, TTS SSE) | `src/routes/coach.session.$sessionId.tsx`, `VoiceController.tsx` | Adicionar 3 fases (preparação/execução/correção) + feedback pós-série |
| Resumo pós-treino | `src/routes/coach.summary.$sessionId.tsx` | Adicionar animação anel 100% + confete discreto |
| Catálogo com 10 exercícios validados + substitutos | tabela `exercise_catalog` | Já cobre o pedido |
| Sessões persistidas por client_session_id | tabela `workout_sessions` | Já cobre |

## Novo (o que falta)

**Rotas novas** (aliases + placeholders funcionais reaproveitando componentes existentes):
- `/onboarding` — 3 passos coletando objetivo/nível/frequência → grava em `profiles`
- `/dashboard` — alias que redireciona p/ `/` (mantém link estável)
- `/workouts` — hoje é `/browse`, adicionar redirect
- `/workouts/$id` — hoje é `/workout/$id`, adicionar redirect
- `/workout-session/$id` — alias de `/coach/session/$id`
- `/ai-trainer` — alias de `/coach`
- `/history` — nova, lista `workout_sessions` do client_session_id
- `/progress` — nova, gráfico simples (Recharts já disponível? checar) das `daily_metrics`
- `/profile` — nova, edita `profiles`
- `/settings` — nova, toggles de voz / redução de movimento / correção postural

**Tabelas novas no Supabase** (única migração):
- `profiles` (opcional-auth: usa `client_session_id` já que não há login ainda; quando auth existir, migra p/ `user_id`)
- `daily_metrics` (steps, calorias, água, distância por dia)
- `user_achievements`
- Renomeia/estende `exercise_catalog` **não** — já bate com o spec, só adiciona colunas faltantes se necessário.

Vou **manter o modelo sem-auth** (client_session_id) porque o app inteiro funciona assim hoje; adicionar auth agora quebraria WhatsApp/Coach. Se quiser auth de verdade, pedimos numa fase separada.

## Fase 1 — o que entrego agora (só isso)

1. **Design system**: alinhar tokens em `src/styles.css` à paleta exata da imagem (#090B0E, #171A1F, #25282E, #B7FF52, #D1FF8A, #FF941F, #11C5DF).
2. **SplashScreen** já existe → ajusto p/ 2.5s + prefetch de queries do dashboard em paralelo (não bloqueia).
3. **DashboardHeader / StepsProgressCard / ActivityRings / MetricCard / WorkoutCard**: extraio do `index.tsx` monolítico p/ componentes reutilizáveis; adiciono contagem animada (Framer Motion `useSpring`) e anéis SVG.
4. **BottomNavigation**: renomeio itens e ajusto FAB central; adiciono rotas placeholder p/ que nenhum item vá pra 404.
5. **Aliases de rota** (`/dashboard`, `/workouts`, `/ai-trainer`, `/workout-session/$id`) — file routes finas que fazem `redirect()` p/ as existentes.
6. **Placeholders funcionais** (não vazios) para `/history`, `/progress`, `/profile`, `/settings` — com skeleton + dados reais quando disponíveis (history lê `workout_sessions` já existente).
7. **Migração Supabase**: `profiles`, `daily_metrics`, `user_achievements` (+ GRANTs + RLS por `client_session_id`).
8. **Responsividade + prefers-reduced-motion**: já respeitado no que existe; garanto nos novos componentes.

Fora do escopo desta fase (as próximas): modelo GLB real, MediaPipe/correção postural, TTS voice-picker, gráficos avançados de progresso, achievements automáticos, integração de câmera.

## Regras que vou seguir (do seu brief)

- Não removo funcionalidade atual (WhatsApp fica intocado)
- Nenhum botão sem ação, nenhum link quebrado
- Sem lorem ipsum; conteúdo em pt-BR
- Sem gradientes excessivos
- Mobile-first, desktop centralizado como painel ampliado (já é assim via `MobileFrame`)
- IA continua restrita ao whitelist do catálogo (já está)
- Correção postural = arquitetura preparada, mas **não** implementada nesta fase (Fase 6 do seu brief)
- Trainer 3D permanece procedural e **eu deixo isso explícito na UI** ("demonstração estilizada"), com props prontas p/ receber GLB depois

## Arquivos que Fase 1 vai tocar

Novos:
- `src/routes/onboarding.tsx`, `dashboard.tsx`, `workouts.tsx`, `workouts.$id.tsx`, `workout-session.$id.tsx`, `ai-trainer.tsx`, `history.tsx`, `progress.tsx`, `profile.tsx`, `settings.tsx`
- `src/components/DashboardHeader.tsx`, `StepsProgressCard.tsx`, `ActivityRings.tsx`, `MetricCard.tsx`, `WorkoutCard.tsx`, `LoadingSkeleton.tsx`
- `src/hooks/useAnimatedNumber.ts`
- 1 migração Supabase

Alterados:
- `src/styles.css` (tokens da paleta nova)
- `src/routes/index.tsx` (usar novos componentes)
- `src/components/BottomNav.tsx` (labels/rotas)
- `src/routes/splash.tsx` (timing 2.5s + prefetch)

Intocados: `whatsapp.tsx`, `coach.*`, `Trainer3DViewer.tsx`, `VoiceController.tsx`, integração Evolution, `player.tsx`, etc.

---

**Confirma que posso executar Fase 1 nesses termos** (paleta exata da imagem, sem-auth via client_session_id, Trainer 3D procedural mantido com honesty label), ou quer ajustar algo antes?
