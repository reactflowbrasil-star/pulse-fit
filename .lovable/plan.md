
# Análise do projeto atual

**Stack já em uso:** TanStack Start + React 19 + Tailwind v4 + Lovable Cloud (Supabase) + Lovable AI Gateway (`LOVABLE_API_KEY` já provisionado). Rotas file-based em `src/routes/`, design tokens em `src/styles.css` (dark, verde-limão `#D5FF5F`), componentes em `src/components/` (`MobileFrame`, `BottomNav`, `StatusBar`, `ScreenHeader`), WhatsApp bot funcional, tabelas `whatsapp_*`. Sem dependências 3D instaladas ainda.

Reutilizo tudo isso. **Não recrio nada** do que já existe.

# Realidade técnica — o que uma web app pode e não pode

| Item da spec | Viável no Lovable web? | Observação |
|---|---|---|
| Splash animada + microinterações + entrada do dashboard | ✅ Sim | CSS + Framer-motion (leve) |
| IA gerando treino estruturado (JSON validado) | ✅ Sim | Lovable AI `openai/gpt-5.5` + Zod + whitelist |
| Voz TTS (mute/volume/legendas) | ✅ Sim | Lovable AI `openai/gpt-4o-mini-tts` streaming SSE |
| Pause/next/pain/substituir/feedback pós-série | ✅ Sim | UI + state machine |
| Resumo do treino + histórico salvo | ✅ Sim | Nova tabela `workout_sessions` |
| Modo sem câmera (100% do fluxo) | ✅ Sim | Prioridade da Fase 1 |
| Avatar 3D **estilizado** (Ready Player Me) com animações **Mixamo** (~8 exercícios) e controle de câmera | ⚠️ Parcial | Rigged humanoid grátis, mas biblioteca limitada de mocap por exercício. Se o exercício exato não existe no Mixamo, uso a mais próxima ou fallback ilustração. |
| **Humano fotorrealista com lip-sync, expressões faciais, sombras de estúdio, roupas específicas** | ❌ Não neste escopo | Requer modelagem/rigging profissional, mocap dedicada, blendshapes ARKit, pipeline de renderização de meses. Web browsers não rodam Unreal MetaHuman. **Proposta:** avatar RPM estilizado com contorno verde — cumpre o "acolhedor, atlético, integrado à interface" sem prometer o que não entrega. |
| Análise postural por câmera (MediaPipe/pose) | ❌ Fora da Fase 1 | Adiciona ~2MB de assets, permissões, consentimento, calibração. Merece uma fase própria — se você quiser, ficaria como Fase 3. |
| Sincronização labial e expressões faciais | ❌ Fora da Fase 1 | Depende de blendshapes + análise de fonemas do TTS. |

Recomendo **entregar Fases 1 e 2** agora. Fase 3 (câmera/pose) e Fase 4 (avatar fotorrealista comprado) ficam para depois, com escopo próprio.

# Fase 1 — Splash + animações de entrada + microinterações

**Arquivos novos:**
- `src/routes/splash.tsx` — splash 2–3s (logo fade+scale, glow verde, anel de progresso, frase "Seu próximo nível começa agora", transição suave). Pré-carrega em paralelo: perfil, últimos treinos, plano ativo (via `Promise.all`).
- `src/components/AnimatedLogo.tsx` — logo com animação de respiração.
- `src/components/ActivityRing.tsx` — anel SVG genérico (extrai lógica já presente no dashboard).
- `src/hooks/useReducedMotion.ts` — respeita `prefers-reduced-motion`.

**Modificações:**
- `src/routes/index.tsx` — animações de entrada em cascata (header→cards→progresso→lista) só na primeira visita ou após invalidação de dados; usar CSS keyframes já existentes (`fade-in`, `scale-in`) + novos.
- `src/components/BottomNav.tsx` — pulse discreto no FAB central (já está no design).
- `src/styles.css` — adicionar keyframes `logo-breathe`, `ring-draw`, `count-up`, `pulse-fab`.

**Deps novas:** nenhuma (CSS puro + Web Animations API para count-up).

# Fase 2 — "Treino com IA" (rota `/coach`)

**Nova tabela (migration):**
```
exercise_catalog   -- ~10 exercícios validados: id, nome, grupo, animation_id, angulos, instrucoes, erros, variacao_facil, variacao_hard, substituicoes
workout_sessions   -- sessões: user_id, plan_json, started_at, ended_at, feedback_json, calories, esforco
```
Seed dos 10 exercícios (agachamento, flexão, prancha, avanço, jumping-jack, mountain-climber, burpee, glute-bridge, rosca com garrafa, elevação lateral) na mesma migration.

**Serviço de IA (`src/lib/coach.functions.ts`):**
- `generateWorkoutPlan(context)` — server fn `createServerFn`, chama Lovable AI `openai/gpt-5.5` com `Output.object` e schema Zod estrito. Prompt inclui catálogo validado; a IA **só pode escolher `exerciseId` do catálogo**. Camada de validação rejeita qualquer exercício fora da whitelist.
- `getExerciseInstruction(exerciseId, userContext)` — devolve JSON no formato da spec (`voiceInstruction`, `commonMistakes`, etc.), sempre com fallback local se a IA falhar.
- `adaptNextExercise(sessionId, difficultyFeedback)` — reduz reps / troca / aumenta descanso.

**Voz (`src/routes/api/coach/tts.ts` — server route):**
- Proxy SSE para Lovable AI TTS (`openai/gpt-4o-mini-tts`), PCM 24kHz, `stream_format: sse`. Client toca via AudioContext (snippet do knowledge). Chunking se instrução > 400 palavras.

**Avatar 3D (`src/components/Trainer3DViewer.tsx`):**
- `@react-three/fiber` + `@react-three/drei` + `three`.
- Carrega avatar Ready Player Me (URL glb pública, gratuito, sem chave).
- Animações Mixamo (retargetadas para o rig RPM — usar `@pixiv/three-vrm` **não**; usar clips FBX Mixamo baixados manualmente e servidos de `/public/animations/`).
- Estados: idle, greeting, explaining, demonstrating (por exercício), counting, resting, celebrating, error.
- Câmera com 3 presets: frontal, lateral, 45°. Transição suave via `lerp`.
- LOD e `Suspense` + skeleton 2D (ilustração) enquanto carrega. Fallback total: se WebGL indisponível ou GPU fraca (detectado via `navigator.gpu`/timing), rola ilustração 2D animada.
- Lazy import da rota `/coach` para não pesar no bundle inicial.

**Componentes novos:**
- `Trainer3DViewer`, `TrainerStateController` (state machine XState-light em hook próprio), `ExerciseInstructionPanel`, `WorkoutProgressHeader`, `VoiceController` (mute/volume/repetir/legenda), `CameraAngleSelector`, `PainSafetyModal`, `PostSetFeedback`, `WorkoutSummary`, `AIWorkoutService` (client wrapper).

**Rotas:**
- `/coach` — onboarding: escolha objetivo, nível, tempo, local, equipamento → gera plano.
- `/coach/session/$sessionId` — tela guiada (avatar + header + controles + painel recolhível).
- `/coach/summary/$sessionId` — resumo animado (círculo 100%, glow verde, gesto do treinador, botões salvar/compartilhar/avaliar).

**Fluxo de erro / offline:** cada exercício traz `voiceInstruction` e `executionSteps` locais no catálogo, então se IA/TTS/3D falharem, a sessão **continua** com instruções em texto e ilustração 2D.

# Fora do escopo desta entrega (fases futuras)

- **Fase 3:** análise postural via câmera (MediaPipe Pose), consentimento, feedback "afaste os pés", modo com câmera.
- **Fase 4:** avatar fotorrealista (MetaHuman via streaming Pixel Streaming, ou modelos comerciais). Requer decisão de custo e infra.
- **Sync labial e expressões faciais** — atrelado à Fase 4.
- **STT** para perguntas por voz — a spec pede, mas depende do `openai/gpt-4o-transcribe`; posso adicionar como pequena Fase 2.5 se quiser.

# Dados/segurança

- `workout_sessions` com RLS por `user_id` (auth Lovable Cloud, ainda não temos login — precisa decidir: adiciono login email+Google agora, ou sessão anônima por `localStorage` até você decidir auth?).
- Camada de validação IA→catálogo é o único caminho para o avatar/voz — nunca a IA controla o avatar direto.
- Nenhum áudio/vídeo do usuário é enviado ou armazenado nesta fase (não há câmera).

# Perguntas antes de começar

1. **Escopo confirmado:** Fases 1 + 2 agora, Fase 3 (câmera) depois? Ou você quer só a Fase 1 primeiro para revisar?
2. **Auth:** quer que eu adicione login (email/Google) agora para `workout_sessions` por usuário, ou uso `localStorage` temporário?
3. **Avatar RPM:** posso usar um avatar Ready Player Me padrão (masculino atlético) e depois adicionar seletor de gênero/energia, ou você prefere só ilustração 2D animada nesta primeira entrega (mais rápido, mais leve, sem dependências 3D)?

Confirme essas 3 questões e eu inicio a implementação por fases, sem alterar nada do que já existe.
