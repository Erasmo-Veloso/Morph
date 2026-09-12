"use client";

import Image from "next/image";
import { useMemo, useState, type ComponentType } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Calculator,
  Camera,
  ChartLine,
  Check,
  ChevronRight,
  Compass,
  Eye,
  FileCode2,
  Gauge,
  LoaderCircle,
  NotebookPen,
  Play,
  Sparkles,
  Timer,
  X
} from "lucide-react";
import type { Capability, CompileResult, LearningCapsule, LearningPhase, PhaseId } from "@/lib/capsule";
import type { LessonSession } from "@/lib/session-store";

const defaultIntent =
  "Ensinar movimento acelerado com uma explicação breve, experimento prático, análise de resultados e reflexão.";

const phaseMeta: Record<
  PhaseId,
  { label: string; description: string; detail: string; icon: ComponentType<{ size?: number; strokeWidth?: number }> }
> = {
  UNDERSTAND: {
    label: "Compreender",
    description: "Os alunos exploram o conceito antes de o medir.",
    detail: "Conteúdo e explicação guiada",
    icon: Compass
  },
  MEASURE: {
    label: "Medir",
    description: "O telefone transforma-se num instrumento de experiência.",
    detail: "Acelerómetro, câmara e cronómetro",
    icon: Activity
  },
  ANALYSE: {
    label: "Analisar",
    description: "Os dados recolhidos tornam-se evidência para interpretar.",
    detail: "Dados locais, gráfico e cálculo",
    icon: Gauge
  },
  REFLECT: {
    label: "Refletir",
    description: "Cada aluno fecha a aula com uma conclusão pessoal.",
    detail: "Exit ticket e conclusão individual",
    icon: Sparkles
  }
};

const capabilityMeta: Record<Capability, { label: string; icon: ComponentType<{ size?: number; strokeWidth?: number }> }> = {
  LEARNING_CONTENT: { label: "Conteúdo Morph", icon: BookOpen },
  GUIDED_EXPLANATION: { label: "Explicação guiada", icon: Compass },
  ACCELEROMETER: { label: "Acelerómetro", icon: Activity },
  GYROSCOPE: { label: "Giroscópio", icon: Activity },
  CAMERA: { label: "Câmara", icon: Camera },
  CHRONOMETER: { label: "Cronómetro", icon: Timer },
  COLLECTED_DATA: { label: "Dados recolhidos", icon: NotebookPen },
  GRAPH: { label: "Gráfico", icon: ChartLine },
  CALCULATOR: { label: "Calculadora", icon: Calculator },
  EXIT_TICKET: { label: "Exit ticket", icon: NotebookPen }
};

const configurableCapabilities: Record<PhaseId, Capability[]> = {
  UNDERSTAND: ["LEARNING_CONTENT", "GUIDED_EXPLANATION"],
  MEASURE: ["ACCELEROMETER", "GYROSCOPE", "CAMERA", "CHRONOMETER"],
  ANALYSE: ["COLLECTED_DATA", "GRAPH", "CALCULATOR"],
  REFLECT: ["EXIT_TICKET"]
};

type ApiResponse = { session?: LessonSession } & Partial<CompileResult>;

async function postJson(path: string, body?: unknown): Promise<ApiResponse> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function formatCapability(capability: string) {
  return capability.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function TeacherDashboard({ initialCapsule }: { initialCapsule: LearningCapsule }) {
  const [intent, setIntent] = useState(defaultIntent);
  const [capsule, setCapsule] = useState(initialCapsule);
  const [session, setSession] = useState<LessonSession | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [view, setView] = useState<"intent" | "configure" | "present">("intent");
  const [selectedPhaseId, setSelectedPhaseId] = useState<PhaseId>("UNDERSTAND");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const activePhase = useMemo(() => {
    if (!session || session.currentPhase === "COMPLETED") return null;
    return capsule.phases.find((phase) => phase.id === session.currentPhase) ?? null;
  }, [capsule.phases, session]);

  const selectedPhase = capsule.phases.find((phase) => phase.id === selectedPhaseId) ?? capsule.phases[0]!;
  const presentationPhase = activePhase ?? selectedPhase;
  const presentationIndex = capsule.phases.findIndex((phase) => phase.id === presentationPhase.id);
  const isLastPhase = presentationIndex === capsule.phases.length - 1;
  const PhaseIcon = phaseMeta[presentationPhase.id].icon;

  async function runAction(action: () => Promise<ApiResponse>) {
    setIsBusy(true);
    try {
      const result = await action();
      if (result.capsule) setCapsule(result.capsule);
      if (result.session) setSession(result.session);
      return result;
    } finally {
      setIsBusy(false);
    }
  }

  async function compileLesson() {
    await runAction(() => postJson("/api/compile", { intent }));
    setSelectedPhaseId("UNDERSTAND");
    setView("configure");
  }

  async function startSimulation() {
    await runAction(() => postJson("/api/session/start"));
  }

  async function advanceSimulation() {
    if (isLastPhase) {
      await runAction(() => postJson("/api/session/end"));
      setSession(null);
      setView("intent");
      setSelectedPhaseId("UNDERSTAND");
      setIsPreviewOpen(false);
      return;
    }

    await runAction(() => postJson("/api/session/next"));
  }

  function updatePhase(phaseId: PhaseId, changes: Partial<Pick<LearningPhase, "duration" | "capabilities">>) {
    setCapsule((current) => ({
      ...current,
      phases: current.phases.map((phase) => phase.id === phaseId ? { ...phase, ...changes } : phase)
    }));
  }

  function toggleCapability(capability: Capability) {
    const isEnabled = selectedPhase.capabilities.includes(capability);
    const capabilities = isEnabled
      ? selectedPhase.capabilities.filter((item) => item !== capability)
      : [...selectedPhase.capabilities, capability];
    updatePhase(selectedPhase.id, { capabilities });
  }

  async function confirmCapsule() {
    await runAction(() => postJson("/api/capsule", { capsule }));
    setView("present");
  }

  return (
    <main className="presentation-shell">
      <header className="presentation-header">
        <a className="brand" href="#presentation" aria-label="morph">
          <Image src="/brand/logo.png" alt="morph" width={112} height={42} priority />
        </a>
        <div className="header-status">
          <span className="status-dot" />
          <span>Simulação guiada</span>
        </div>
        <button className="preview-trigger" type="button" onClick={() => setIsPreviewOpen(true)}>
          <Eye size={16} /> Ver dispositivo
        </button>
      </header>

      <section className="presentation" id="presentation">
        {view === "intent" ? (
          <section className="intent-stage" aria-labelledby="intent-title">
            <div className="stage-copy">
              <p className="stage-eyebrow">Passo 01 <span /> Intenção pedagógica</p>
              <h1 id="intent-title">O que os alunos vão aprender hoje?</h1>
              <p>Descreva a aula. A Morph transforma a sua intenção numa experiência executável no telefone.</p>
            </div>
            <div className="intent-composer">
              <label htmlFor="lesson-intent">Descrição da aula</label>
              <textarea
                id="lesson-intent"
                value={intent}
                onChange={(event) => setIntent(event.target.value)}
                placeholder="Descreva o que os alunos vão aprender e fazer..."
              />
              <div className="composer-footer">
                <span><Check size={15} /> Funciona sem Internet</span>
                <button className="main-action" type="button" disabled={isBusy} onClick={compileLesson}>
                  {isBusy ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}
                  Compilar a aula
                </button>
              </div>
            </div>
          </section>
        ) : view === "configure" ? (
          <section className="configuration-stage" aria-labelledby="configuration-title">
            <div className="configuration-heading">
              <p className="stage-eyebrow">Passo 02 <span /> Configurar a Cápsula</p>
              <h1 id="configuration-title">Defina o que o telefone pode fazer em cada etapa.</h1>
              <p>As aplicações seleccionadas tornam-se capacidades disponíveis apenas durante a etapa escolhida.</p>
            </div>

            <div className="configuration-workspace">
              <nav className="configuration-phases" aria-label="Etapas configuráveis">
                {capsule.phases.map((phase, index) => {
                  const Icon = phaseMeta[phase.id].icon;
                  const isSelected = phase.id === selectedPhase.id;
                  return <button className={isSelected ? "configuration-phase selected" : "configuration-phase"} type="button" key={phase.id} onClick={() => setSelectedPhaseId(phase.id)}>
                    <span>{String(index + 1).padStart(2, "0")}</span><Icon size={17} /><strong>{phaseMeta[phase.id].label}</strong><ChevronRight size={15} />
                  </button>;
                })}
              </nav>

              <section className="phase-configuration" aria-labelledby="selected-phase-title">
                <div className="phase-configuration-head">
                  <div><p>Etapa seleccionada</p><h2 id="selected-phase-title">{phaseMeta[selectedPhase.id].label}</h2></div>
                  <label className="duration-control">Duração <input type="number" min="1" max="60" value={Math.round(selectedPhase.duration / 60)} onChange={(event) => updatePhase(selectedPhase.id, { duration: Math.max(1, Number(event.target.value) || 1) * 60 })} /> <span>min</span></label>
                </div>
                <p className="application-intro">Aplicações disponíveis nesta etapa</p>
                <div className="application-list">
                  {configurableCapabilities[selectedPhase.id].map((capability) => {
                    const Icon = capabilityMeta[capability].icon;
                    return <label className="application-option" key={capability}><input type="checkbox" checked={selectedPhase.capabilities.includes(capability)} onChange={() => toggleCapability(capability)} /><span className="application-check"><Check size={13} /></span><Icon size={17} /><span>{capabilityMeta[capability].label}</span></label>;
                  })}
                </div>
                <p className="configuration-note">Outras aplicações permanecem indisponíveis enquanto esta etapa estiver ativa.</p>
              </section>
            </div>

            <div className="configuration-action"><button className="main-action" type="button" disabled={isBusy} onClick={confirmCapsule}>{isBusy ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />} Confirmar Cápsula</button><span>As suas escolhas serão enviadas para o Android local runtime.</span></div>
          </section>
        ) : (
          <section className="phase-stage" aria-labelledby="phase-title">
            <div className="phase-stage-top">
              <p className="stage-eyebrow">Learning Capsule <span /> Movimento acelerado</p>
              <span className="phase-count">Etapa {presentationIndex + 1} de {capsule.phases.length}</span>
            </div>

            <div className={`phase-focus phase-${presentationPhase.id.toLowerCase()}`}>
              <div className="phase-symbol"><PhaseIcon size={38} /></div>
              <p className="phase-kicker">{session ? "Fase ativa" : "Cápsula compilada"}</p>
              <h1 id="phase-title">{phaseMeta[presentationPhase.id].label}</h1>
              <p className="phase-description">{phaseMeta[presentationPhase.id].description}</p>
              <div className="phase-detail"><FileCode2 size={17} /> {phaseMeta[presentationPhase.id].detail}</div>
            </div>

            <nav className="phase-navigation" aria-label="Etapas da aula">
              {capsule.phases.map((phase, index) => {
                const isCurrent = phase.id === presentationPhase.id;
                return <div className={isCurrent ? "phase-nav-item current" : "phase-nav-item"} key={phase.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{phaseMeta[phase.id].label}</strong>
                  {index < capsule.phases.length - 1 ? <ChevronRight size={16} /> : null}
                </div>;
              })}
            </nav>

            <div className="stage-action">
              {!session ? (
                <button className="main-action" type="button" disabled={isBusy} onClick={startSimulation}>
                  <Play size={17} fill="currentColor" /> Iniciar simulação
                </button>
              ) : (
                <button className="main-action" type="button" disabled={isBusy} onClick={advanceSimulation}>
                  {isLastPhase ? <Check size={18} /> : <ArrowRight size={18} />}
                  {isLastPhase ? "Concluir simulação" : "Próxima etapa"}
                </button>
              )}
              <span>{!session ? "A Cápsula está pronta para ser enviada ao dispositivo." : "O dispositivo atualiza-se imediatamente."}</span>
            </div>
          </section>
        )}
      </section>

      {isPreviewOpen ? (
        <div className="preview-overlay" role="dialog" aria-modal="true" aria-labelledby="preview-title">
          <section className={`device-modal phase-${presentationPhase.id.toLowerCase()}`}>
            <div className="modal-header">
              <div><p>Android local runtime</p><h2 id="preview-title">Pré-visualização</h2></div>
              <button className="close-preview" type="button" onClick={() => setIsPreviewOpen(false)} aria-label="Fechar pré-visualização"><X size={18} /></button>
            </div>
            <div className="phone-frame">
              <div className="phone-island" />
              <div className="phone-header"><span>morph</span><span>{session ? "AO VIVO" : "PREVIEW"}</span></div>
              <div className="runtime-screen">
                <div className="runtime-step"><span>0{presentationIndex + 1}</span><span>{Math.floor(presentationPhase.duration / 60)} min</span></div>
                <div className="runtime-icon"><PhaseIcon size={29} /></div>
                <p>FASE {session ? "ATIVA" : "PREPARADA"}</p>
                <h3>{phaseMeta[presentationPhase.id].label}</h3>
                <span className="runtime-detail">{phaseMeta[presentationPhase.id].detail}</span>
                {presentationPhase.id === "MEASURE" && session ? <div className="sensor-module"><span>ACELERÓMETRO</span><strong>+1.84 <small>m/s2</small></strong><div className="sensor-bars"><i /><i /><i /><i /><i /><i /></div></div> : null}
                {presentationPhase.id === "ANALYSE" && session ? <div className="analysis-module"><span>DADOS LOCAIS</span><div className="mini-chart"><i /><i /><i /><i /><i /></div></div> : null}
                {presentationPhase.id === "REFLECT" && session ? <div className="reflection-module"><Check size={16} /> Registo individual pronto</div> : null}
                {session ? <div className="runtime-capabilities">{presentationPhase.capabilities.slice(0, 3).map((capability) => <span key={capability}>{formatCapability(capability)}</span>)}</div> : null}
              </div>
              <div className="phone-home" />
            </div>
            <p className="modal-caption">O dispositivo recebe apenas as capacidades desta etapa.</p>
          </section>
        </div>
      ) : null}
    </main>
  );
}
