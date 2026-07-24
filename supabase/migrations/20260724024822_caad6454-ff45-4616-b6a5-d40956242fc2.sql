
-- Exercise catalog (read-only, seeded)
CREATE TABLE public.exercise_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  level TEXT NOT NULL,
  equipment TEXT[] NOT NULL DEFAULT '{}',
  animation_id TEXT NOT NULL,
  allowed_camera_angles TEXT[] NOT NULL DEFAULT ARRAY['frontal','lateral','angulo_45'],
  default_sets INT NOT NULL DEFAULT 3,
  default_reps TEXT NOT NULL DEFAULT '10',
  default_duration_s INT,
  default_rest_s INT NOT NULL DEFAULT 30,
  initial_position TEXT[] NOT NULL DEFAULT '{}',
  execution_steps TEXT[] NOT NULL DEFAULT '{}',
  breathing TEXT,
  common_mistakes TEXT[] NOT NULL DEFAULT '{}',
  safety_warnings TEXT[] NOT NULL DEFAULT '{}',
  easier_variation TEXT,
  harder_variation TEXT,
  substitute_exercise_ids TEXT[] NOT NULL DEFAULT '{}',
  default_voice_instruction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.exercise_catalog TO anon;
GRANT SELECT ON public.exercise_catalog TO authenticated;
GRANT ALL ON public.exercise_catalog TO service_role;

ALTER TABLE public.exercise_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catálogo de exercícios é público para leitura"
  ON public.exercise_catalog FOR SELECT
  USING (true);

-- Workout sessions (local sessions keyed by client_session_id)
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context JSONB NOT NULL DEFAULT '{}',
  plan JSONB NOT NULL DEFAULT '{}',
  feedback JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'in_progress',
  duration_seconds INT NOT NULL DEFAULT 0,
  calories_estimate INT NOT NULL DEFAULT 0,
  effort_level INT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.workout_sessions (client_session_id);
CREATE INDEX ON public.workout_sessions (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sessions TO authenticated;
GRANT ALL ON public.workout_sessions TO service_role;

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- Sessions are scoped by client_session_id (localStorage) until auth is added.
-- Reads/writes are open because the id is a large random UUID stored client-side.
CREATE POLICY "Sessões acessíveis por client_session_id" ON public.workout_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 10 exercises
INSERT INTO public.exercise_catalog (id, name, category, muscle_group, level, equipment, animation_id, default_sets, default_reps, default_duration_s, default_rest_s, initial_position, execution_steps, breathing, common_mistakes, safety_warnings, easier_variation, harder_variation, substitute_exercise_ids, default_voice_instruction) VALUES
('agachamento_livre','Agachamento Livre','forca','pernas','iniciante','{}','squat',3,'12',NULL,45,
 ARRAY['Pés na largura dos ombros','Coluna neutra','Olhar à frente'],
 ARRAY['Desça flexionando quadris e joelhos','Mantenha o peso nos calcanhares','Retorne empurrando o chão'],
 'Inspire ao descer e expire ao subir',
 ARRAY['Joelhos caindo para dentro','Coluna curvada','Calcanhares saindo do chão'],
 ARRAY['Pare se sentir dor nos joelhos ou lombar'],
 'agachamento_apoio','agachamento_salto',ARRAY['agachamento_apoio'],
 'Desça controlado até a linha dos joelhos. Suba com força pelos calcanhares.'),
('flexao_braco','Flexão de Braço','forca','peito','intermediario','{}','pushup',3,'10',NULL,45,
 ARRAY['Mãos alinhadas aos ombros','Corpo em linha reta','Abdômen contraído'],
 ARRAY['Desça flexionando os cotovelos','Toque quase o chão com o peito','Empurre de volta'],
 'Inspire ao descer, expire ao subir',
 ARRAY['Quadril caindo','Cotovelos abrindo em 90 graus','Não descer até o fim'],
 ARRAY['Interrompa se sentir dor no ombro'],
 'flexao_joelhos','flexao_diamante',ARRAY['flexao_joelhos'],
 'Corpo alinhado da cabeça aos calcanhares. Cotovelos a 45 graus.'),
('prancha_isometrica','Prancha Isométrica','core','core','iniciante','{}','plank',3,'30 seg',30,45,
 ARRAY['Cotovelos abaixo dos ombros','Corpo reto','Glúteos contraídos'],
 ARRAY['Sustente a posição','Respire de forma contínua'],
 'Respiração contínua e calma',
 ARRAY['Quadril caído','Quadril alto demais','Prender a respiração'],
 ARRAY['Descanse se sentir tremor excessivo na lombar'],
 'prancha_joelhos','prancha_uma_perna',ARRAY['prancha_joelhos'],
 'Mantenha o corpo em linha reta. Não deixe o quadril cair.'),
('avanco','Avanço','forca','pernas','intermediario','{}','lunge',3,'10 por perna',NULL,40,
 ARRAY['Pé à frente','Tronco ereto','Passo firme'],
 ARRAY['Dê um passo à frente','Desça flexionando os joelhos','Empurre para voltar'],
 'Inspire ao descer, expire ao subir',
 ARRAY['Joelho da frente ultrapassando o pé','Tronco inclinado','Passo curto demais'],
 ARRAY['Cuidado com equilíbrio'],
 'avanco_estatico','avanco_salto',ARRAY['agachamento_livre'],
 'Passo firme e desça em ângulos de 90 graus.'),
('polichinelo','Polichinelo','cardio','corpo_todo','iniciante','{}','jumpingjack',3,'30 seg',30,20,
 ARRAY['Pés juntos','Braços ao lado do corpo'],
 ARRAY['Salte abrindo pernas e braços','Retorne à posição inicial'],
 'Respiração ritmada com o movimento',
 ARRAY['Movimento lento demais','Não abrir totalmente os braços'],
 ARRAY['Reduza o ritmo se sentir tontura'],
 'polichinelo_step','polichinelo_agachado',ARRAY[]::text[],
 'Ritmo firme e constante. Braços totalmente estendidos.'),
('escalador','Escalador','cardio','core','intermediario','{}','mountain_climber',3,'30 seg',30,30,
 ARRAY['Posição de prancha alta','Mãos abaixo dos ombros'],
 ARRAY['Traga um joelho ao peito','Alterne rapidamente as pernas'],
 'Respiração contínua',
 ARRAY['Quadril subindo','Movimento pequeno demais'],
 ARRAY['Pare se sentir dor no punho'],
 'escalador_lento','escalador_cruzado',ARRAY['polichinelo'],
 'Corpo firme como uma prancha. Alterne rápido.'),
('ponte_gluteo','Ponte de Glúteo','forca','gluteos','iniciante','{}','glute_bridge',3,'15',NULL,30,
 ARRAY['Deitado de costas','Joelhos flexionados','Pés no chão'],
 ARRAY['Eleve o quadril contraindo o glúteo','Segure no topo','Desça controlado'],
 'Expire ao subir, inspire ao descer',
 ARRAY['Não contrair o glúteo','Hiperextender a lombar'],
 ARRAY['Cuidado com a lombar'],
 'ponte_apoio','ponte_uma_perna',ARRAY[]::text[],
 'Aperte o glúteo no topo por dois segundos.'),
('rosca_direta','Rosca Direta','forca','bracos','iniciante','{"halteres"}','curl',3,'12',NULL,40,
 ARRAY['Cotovelos junto ao corpo','Palmas para cima'],
 ARRAY['Flexione os cotovelos','Suba o peso até os ombros','Desça controlado'],
 'Expire ao subir, inspire ao descer',
 ARRAY['Cotovelos abrindo','Balançar o tronco'],
 ARRAY[]::text[],
 'rosca_alternada','rosca_martelo',ARRAY[]::text[],
 'Movimento apenas do cotovelo. Sem balanço.'),
('elevacao_lateral','Elevação Lateral','forca','ombros','intermediario','{"halteres"}','lateral_raise',3,'12',NULL,40,
 ARRAY['Braços ao lado','Leve flexão dos cotovelos'],
 ARRAY['Eleve os braços até a altura dos ombros','Desça controlado'],
 'Expire ao subir',
 ARRAY['Subir acima da linha do ombro','Usar impulso'],
 ARRAY['Cuidado com dor no ombro'],
 'elevacao_sentado','elevacao_isometrica',ARRAY[]::text[],
 'Suba somente até a altura dos ombros. Movimento lento.'),
('burpee','Burpee','cardio','corpo_todo','avancado','{}','burpee',3,'8',NULL,60,
 ARRAY['Em pé'],
 ARRAY['Agache','Vá para prancha','Faça uma flexão','Salte para os pés','Salte para cima'],
 'Respiração contínua',
 ARRAY['Lombar caindo na prancha','Salto sem controle'],
 ARRAY['Exercício intenso — pare se ficar tonto'],
 'burpee_sem_salto','burpee_flexao_dupla',ARRAY['polichinelo'],
 'Ritmo constante. Cada fase controlada.');
