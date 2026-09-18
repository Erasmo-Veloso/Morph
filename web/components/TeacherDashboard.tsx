"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import gsap from "gsap";
import {
  Activity,
  AppWindow,
  ArrowRight,
  BookOpen,
  Calculator,
  Camera,
  ChartLine,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Eye,
  FolderOpen,
  Gauge,
  Globe,
  GraduationCap,
  LoaderCircle,
  MoreVertical,
  Monitor,
  NotebookPen,
  Play,
  ShieldCheck,
  Sparkles,
  Timer,
  Triangle,
  Users,
  X
} from "lucide-react";
import { withApprovedApps } from "@/lib/capsule";
import type { ApprovedApp, Capability, CompileResult, LearningCapsule, LearningPhase, PhaseId } from "@/lib/capsule";
import type { SchoolConfig } from "@/lib/school-store";
import type { LessonSession } from "@/lib/session-store";
import type { RuntimeStatus } from "@/lib/runtime-bridge";
import type { AppRecommendation, LessonDraft } from "@/lib/capsule-planner";
import { StudioShell, StudioSectionLabel } from "./StudioShell";

const defaultIntent =
  "Ensinar movimento acelerado com uma explicação breve, experimento prático, análise de resultados e reflexão.";

const runtimeEventLabel: Record<string, string> = {
  RESTRICTED_ACCESS_ATTEMPT: "Tentativa fora da etapa",
  SCHOOL_CONTEXT_LOST: "Contexto por confirmar",
  CONNECTIVITY_CHANGED: "Conectividade actualizada",
  POLICY_PERMISSION_CHANGED: "Permissão de protecção alterada"
};

const priorityRuntimeEventTypes = new Set([
  "RESTRICTED_ACCESS_ATTEMPT",
  "SCHOOL_CONTEXT_LOST",
  "POLICY_PERMISSION_CHANGED"
]);

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

const phaseAssets: Record<PhaseId, string> = {
  UNDERSTAND: "/assets/android/understand.png",
  MEASURE: "/assets/android/measure.png",
  ANALYSE: "/assets/android/measure.png",
  REFLECT: "/assets/android/finished.png"
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

const appIconMeta: Record<string, { icon: ComponentType<{ size?: number; strokeWidth?: number }>; tone: string; asset?: string }> = {
  calculator: { icon: Calculator, tone: "calculator", asset: "/assets/apps/calculator.png" },
  "samsung-notes": { icon: NotebookPen, tone: "notes", asset: "/assets/apps/samsung-notes.png" },
  chrome: { icon: Globe, tone: "chrome", asset: "/assets/apps/chrome.png" },
  camera: { icon: Camera, tone: "camera", asset: "/assets/apps/camera.png" },
  files: { icon: FolderOpen, tone: "files", asset: "/assets/apps/files.jpg" },
  classroom: { icon: GraduationCap, tone: "classroom", asset: "/assets/apps/classroom.png" },
  drive: { icon: Triangle, tone: "drive", asset: "/assets/apps/drive.png" }
};

function AppIcon({ app }: { app: ApprovedApp }) {
  const meta = appIconMeta[app.id] ?? { icon: AppWindow, tone: "custom" };
  const Icon = meta.icon;
  return <span className={`app-icon app-icon-${meta.tone}`} aria-hidden="true">
    {meta.asset ? <Image src={meta.asset} alt="" width={30} height={30} /> : <Icon size={15} strokeWidth={2.3} />}
  </span>;
}

type ApiResponse = { session?: LessonSession; source?: "groq" | "fallback"; draft?: LessonDraft } & Partial<CompileResult>;

async function postJson(path: string, body?: unknown): Promise<ApiResponse> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? `Request failed: ${response.status}`);
  return payload;
}
function AndroidAnalysisPreview() {
  return <div className="android-analysis-screen" aria-label="Pré-visualização nativa Android da fase Analisar">
    <div className="android-analysis-status"><span>11:52</span><span>5G&nbsp; ◢&nbsp; ▣</span></div>
    <Image className="android-analysis-brand" src="/brand/morph-lockup.jpg" alt="morph" width={160} height={60} />
    <div className="android-analysis-runtime"><span>● EM AULA</span><i>·</i><span>● ONLINE</span></div>
    <div className="android-analysis-permission">⚙&nbsp; Abrir permissões de protecção</div>
    <span className="android-analysis-kicker">CAPSULE · 03 / 04</span>
    <h3>Analisar</h3>
    <p>Os dados recolhidos tornam-se evidência.</p>
    <span className="android-analysis-rule" />
    <div className="android-analysis-card">
      <span>ANALISAR</span>
      <strong>Padrão de movimento</strong>
      <small>Dados locais preparados para interpretar.</small>
      <div className="android-analysis-chart" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <b>Média: 1,2 m/s²&nbsp; · &nbsp;Pico: 2,4 m/s²</b>
    </div>
    <div className="android-analysis-progress"><span>●</span><i /><span>●</span><i /><span>●</span><i /><span>○</span></div>
    <div className="android-analysis-labels"><span>COMPREENDER</span><span>MEDIR</span><strong>ANALISAR</strong><span>REFLECTIR</span></div>
  </div>;
}

function AndroidPhasePreview({ phase }: { phase: PhaseId }) {
  return phase === "ANALYSE"
    ? <AndroidAnalysisPreview />
    : <Image src={phaseAssets[phase]} alt={`Android Morph · ${phaseMeta[phase].label}`} fill sizes="(max-width: 760px) 90vw, 330px" />;
}

export function TeacherDashboard({ initialCapsule }: { initialCapsule: LearningCapsule }) {
  const [intent, setIntent] = useState(defaultIntent);
  const [capsule, setCapsule] = useState(() => withApprovedApps(initialCapsule));
  const [session, setSession] = useState<LessonSession | null>(null);
  const [hasStartedSession, setHasStartedSession] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [view, setView] = useState<"intent" | "configure" | "present">("intent");
  const [selectedPhaseId, setSelectedPhaseId] = useState<PhaseId>("UNDERSTAND");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [appCatalog, setAppCatalog] = useState<ApprovedApp[]>([]);
  const [appRecommendations, setAppRecommendations] = useState<Partial<Record<PhaseId, AppRecommendation[]>>>({});
  const [plannerSource, setPlannerSource] = useState<"groq" | "fallback" | null>(null);
  const [school, setSchool] = useState<SchoolConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const presentationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const response = await fetch("/api/runtime/status", { cache: "no-store" }).catch(() => null);
      if (!response?.ok) return;
      const status = await response.json() as RuntimeStatus;
      if (active) setRuntimeStatus(status);
    };
    void refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!runtimeStatus) return;
    if (runtimeStatus.session.running) {
      // The bridge is authoritative after a reload. Restore the live view
      // instead of leaving the teacher on the initial intent screen.
      setHasStartedSession(true);
      if (!session) setView("present");
      return;
    }
    if (hasStartedSession || session?.status === "RUNNING") {
      setSession(null);
      setHasStartedSession(false);
      setView("intent");
      setSelectedPhaseId("UNDERSTAND");
      setIsPreviewOpen(false);
    }
  }, [hasStartedSession, runtimeStatus, session]);

  useEffect(() => {
    void fetch("/api/school", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { school?: SchoolConfig }) => { setSchool(payload.school ?? null); setAppCatalog(payload.school?.appCatalog ?? []); })
      .catch(() => { setSchool(null); setAppCatalog([]); });
  }, []);

  const activePhase = useMemo(() => {
    if (runtimeStatus) {
      if (!runtimeStatus.session.running) return null;
      return capsule.phases.find((phase) => phase.id === runtimeStatus.session.phase) ?? null;
    }
    if (!session || session.currentPhase === "COMPLETED") return null;
    return capsule.phases.find((phase) => phase.id === session.currentPhase) ?? null;
  }, [capsule.phases, runtimeStatus, session]);

  const selectedPhase = capsule.phases.find((phase) => phase.id === selectedPhaseId) ?? capsule.phases[0]!;
  const presentationPhase = activePhase ?? selectedPhase;
  const presentationIndex = capsule.phases.findIndex((phase) => phase.id === presentationPhase.id);
  const isLastPhase = presentationIndex === capsule.phases.length - 1;
  const PhaseIcon = phaseMeta[presentationPhase.id].icon;
  const runtimeDevice = runtimeStatus?.devices.at(-1);
  const runtimeEvents = runtimeStatus?.events.slice().reverse() ?? [];
  const latestRuntimeEvent = runtimeEvents.find((event) => priorityRuntimeEventTypes.has(event.type))
    ?? runtimeEvents[0];
  const demoTeacher = school?.teachers.find((teacher) => teacher.id === "teacher-demo") ?? school?.teachers[0];
  const isSessionActive = runtimeStatus ? runtimeStatus.session.running : Boolean(session);

  useEffect(() => {
    const root = presentationRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-enter]");
    const context = gsap.context(() => {
      gsap.fromTo(targets, { autoAlpha: 0, y: 18 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.52,
        stagger: 0.055,
        ease: "power2.out",
        clearProps: "transform"
      });
    }, root);
    return () => context.revert();
  }, [view, presentationPhase.id]);

  async function runAction(action: () => Promise<ApiResponse>) {
    setIsBusy(true);
    setErrorMessage(null);
    try {
      const result = await action();
      if (result.capsule) setCapsule(withApprovedApps(result.capsule));
      if (result.session) setSession(result.session);
      const statusResponse = await fetch("/api/runtime/status", { cache: "no-store" }).catch(() => null);
      if (statusResponse?.ok) setRuntimeStatus(await statusResponse.json() as RuntimeStatus);
      return result;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível concluir esta acção.");
      return null;
    } finally {
      setIsBusy(false);
    }
  }

  async function compileLesson() {
    if (!intent.trim()) {
      setErrorMessage("Descreva a aula antes de pedir uma sugestão.");
      return;
    }
    const result = await runAction(() => postJson("/api/compile", { intent }));
    if (!result) return;
    setPlannerSource(result.source ?? "fallback");
    setAppRecommendations(Object.fromEntries((result.draft?.phases ?? []).map((phase) => [phase.id, phase.recommended_apps])));
    setSelectedPhaseId("UNDERSTAND");
    setView("configure");
  }

  async function startSimulation() {
    const result = await runAction(() => postJson("/api/session/start"));
    if (result?.session) setHasStartedSession(true);
  }

  async function advanceSimulation() {
    if (isLastPhase) {
      const result = await runAction(() => postJson("/api/session/end"));
      if (!result) return;
      setSession(null);
      setHasStartedSession(false);
      setView("intent");
      setSelectedPhaseId("UNDERSTAND");
      setIsPreviewOpen(false);
      return;
    }

    await runAction(() => postJson("/api/session/next"));
  }

  async function updateSchoolContext(command: "context:verified" | "context:unverified" | "context:outside") {
    await runAction(() => postJson("/api/session/context", { command }));
  }

  function updatePhase(phaseId: PhaseId, changes: Partial<Pick<LearningPhase, "duration" | "capabilities" | "allowed_apps">>) {
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

  function toggleAllowedApp(app: ApprovedApp) {
    const isEnabled = selectedPhase.allowed_apps.some((item) => item.id === app.id);
    const allowed_apps = isEnabled
      ? selectedPhase.allowed_apps.filter((item) => item.id !== app.id)
      : [...selectedPhase.allowed_apps, app];
    updatePhase(selectedPhase.id, { allowed_apps });
  }

  async function confirmCapsule() {
    const result = await runAction(() => postJson("/api/capsule", { capsule }));
    if (!result) return;
    setView("present");
  }

  const isRuntimeConnected = Boolean(runtimeDevice);
  const activePhaseMinutes = Math.max(1, Math.round(presentationPhase.duration / 60));
  const phaseInstruction = presentationPhase.learning_assets[0]?.activity
    ?? (presentationPhase.id === "REFLECT"
      ? "Os alunos consolidam o que aprenderam e registam uma reflexão pessoal sobre a experiência."
      : "Os alunos exploram o conceito, executam a atividade e registam evidências antes de avançar.");

  return (
    <StudioShell active="capsules" status={runtimeDevice ? `Android · ${runtimeDevice.connectivity}` : "Aguardando Android"}>
      <section className={`presentation${view === "intent" ? " teacher-intent-presentation" : view === "configure" ? " teacher-configure-presentation" : view === "present" ? ` teacher-capsule-detail-presentation${!isSessionActive ? " teacher-preview-presentation" : ""}` : ""}`} id="presentation" ref={presentationRef}>
        {view === "intent" ? (
          <section className="intent-stage teacher-intent-stage" aria-labelledby="intent-title">
            <div className="stage-copy" data-enter>
              <StudioSectionLabel>Passo 01</StudioSectionLabel>
              <h1 id="intent-title">Criar a Cápsula</h1>
              <p>Descreva a sua aula e o Morph organiza-a automaticamente numa sequência didáctica pronta a usar.</p>
            </div>
            <div className="capsule-summary" data-enter aria-label="Resumo da nova Cápsula">
              <div className="capsule-context"><span>Contexto da aula</span><strong>10.º B · Física</strong><small>30 min · Rascunho</small></div>
              <div className="capsule-topic"><span>Tema da Capsule</span><strong>{capsule.title ?? "Nova Cápsula"}</strong><small>{capsule.subject ?? "Aula interdisciplinar"}</small></div>
            </div>
            <div className="intent-composer" data-enter>
              <div className="composer-heading"><div><span className="composer-kicker">Confirmar o tema</span><strong>O que a turma vai explorar?</strong></div><span className="composer-index">01</span></div>
              <p className="composer-description">Escreva o tema, os objectivos ou as actividades. O Morph organiza a sequência pedagógica.</p>
              <label htmlFor="lesson-intent">Descrição da aula</label>
              <textarea
                id="lesson-intent"
                value={intent}
                onChange={(event) => setIntent(event.target.value)}
                placeholder="Descreva o que os alunos vão aprender e fazer..."
              />
              <div className="intent-suggestions">
                <span>Sugestões rápidas</span>
                <div>
                  {["Explicação curta", "Experiência prática", "Análise de dados", "Reflexão final"].map((suggestion) => <button type="button" key={suggestion} onClick={() => setIntent((current) => current.includes(suggestion) ? current : `${current} ${suggestion.toLowerCase()}.`)}>+&nbsp; {suggestion}</button>)}
                </div>
              </div>
              <div className="composer-footer">
                <button className="secondary-action" type="button" onClick={() => setIntent(defaultIntent)}>Usar modelo</button>
                <button className="main-action" type="button" disabled={isBusy} onClick={compileLesson}>
                  {isBusy ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}
                  Gerar Cápsula <ArrowRight size={17} />
                </button>
              </div>
              <div className="composer-proof"><Check size={15} /> O Morph cria a estrutura com base em princípios de aprendizagem activa.</div>
              <div className="intent-proof">
                <div className="proof-copy"><span>O mesmo smartphone</span><strong>metamorfoseia-se em cada fase.</strong></div>
                <div className="proof-rail" aria-label="Fases da Cápsula">
                  {capsule.phases.map((phase, index) => <span className={index === 0 ? "proof-node active" : "proof-node"} key={phase.id}><i />{phaseMeta[phase.id].label}</span>)}
                </div>
              </div>
            </div>
          </section>
        ) : view === "configure" ? (
          <section className="configuration-stage" aria-labelledby="configuration-title">
            <div className="configuration-heading" data-enter>
              <p className="stage-eyebrow">Passo 02 <span /> Configurar a Cápsula</p>
              <h1 id="configuration-title">Configure a Cápsula</h1>
              <p>Defina o que os seus alunos vão fazer, que ferramentas podem usar e como esta etapa contribui para a aprendizagem.</p>
            </div>

            <div className="configuration-workspace" data-enter>
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
                <p className="application-intro">Capacidades pedagógicas</p>
                <div className="application-list">
                  {configurableCapabilities[selectedPhase.id].map((capability) => {
                    const Icon = capabilityMeta[capability].icon;
                    return <label className="application-option" key={capability}><input type="checkbox" checked={selectedPhase.capabilities.includes(capability)} onChange={() => toggleCapability(capability)} /><span className="application-check"><Check size={13} /></span><Icon size={17} /><span>{capabilityMeta[capability].label}</span></label>;
                  })}
                </div>
                <div className="phase-app-catalog">
                  <div className="phase-app-catalog-head"><div><p>Rever aplicações para esta etapa</p><small>{plannerSource === "groq" ? "Sugestões geradas pelo Groq" : "Sugestões locais"}</small></div><span>{selectedPhase.allowed_apps.length} seleccionada{selectedPhase.allowed_apps.length === 1 ? "" : "s"}</span></div>
                  {(appRecommendations[selectedPhase.id] ?? []).length > 0 ? <div className="app-suggestion-list" aria-label="Sugestões da IA">
                    {(appRecommendations[selectedPhase.id] ?? []).map((recommendation) => {
                      const app = appCatalog.find((item) => item.id === recommendation.id);
                      if (!app) return null;
                      return <div className="app-suggestion" key={recommendation.id}><AppIcon app={app} /><div><strong>{app.name}</strong><small>{recommendation.reason}</small></div><span>Sugerida</span></div>;
                    })}
                  </div> : <p className="catalog-empty">A IA não encontrou uma aplicação necessária para esta etapa. A decisão continua a ser do professor.</p>}
                  {appCatalog.length > 0 ? <div className="application-list app-catalog-list">
                    {appCatalog.map((app) => <label className="application-option" key={app.id}>
                      <input type="checkbox" checked={selectedPhase.allowed_apps.some((item) => item.id === app.id)} onChange={() => toggleAllowedApp(app)} />
                      <span className="application-check"><Check size={13} /></span><AppIcon app={app} /><span><strong>{app.name}</strong><small>{app.category}</small></span>
                    </label>)}
                  </div> : <p className="catalog-empty">O catálogo da escola ainda está a carregar.</p>}
                </div>
                <p className="configuration-note">As sugestões não autorizam nada automaticamente. Apenas as aplicações seleccionadas pelo professor seguem na Cápsula, com bloqueio por defeito para as restantes.</p>
              </section>
            </div>

            <div className="configuration-action" data-enter><button className="main-action" type="button" disabled={isBusy} onClick={confirmCapsule}>{isBusy ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />} Confirmar Cápsula</button><span>As suas escolhas serão enviadas para o Android local runtime.</span></div>
            {errorMessage ? <p className="action-error" role="alert">{errorMessage}</p> : null}
          </section>
        ) : (
          <section className="phase-stage" aria-labelledby="phase-title">
            <div className="live-session-heading" data-enter>
              <div>
                <button className="live-back-link" type="button" onClick={() => setView("intent")}><ArrowRight size={15} /> Voltar à cápsula</button>
                <h1>{capsule.title ?? "Cápsula ao vivo"}</h1>
                <p>{capsule.objective}</p>
              </div>
              <div className="live-heading-actions">
                <span className="live-pill"><i /> {isSessionActive ? "AO VIVO" : "PRÉ-VISUALIZAÇÃO"}</span>
                <button type="button" aria-label="Mais opções"><MoreVertical size={20} /></button>
              </div>
            </div>

            <div className="live-session-meta" data-enter>
              <div><Users size={21} /><span>Turma<strong>{demoTeacher?.className ?? "10.º B"}</strong></span></div>
              <div><Users size={21} /><span>Alunos<strong>{demoTeacher?.studentIds.length ?? 0} online</strong></span></div>
              <div><Timer size={21} /><span>Duração<strong>{activePhaseMinutes} min / 30 min</strong></span></div>
            </div>

            <nav className="live-phase-rail" aria-label="Etapas da aula" data-enter>
              {capsule.phases.map((phase, index) => {
                const Icon = phaseMeta[phase.id].icon;
                const isCurrent = phase.id === presentationPhase.id;
                return <div className={isCurrent ? "live-phase-card current" : "live-phase-card"} key={phase.id}>
                  <span className="live-phase-index">{String(index + 1).padStart(2, "0")}</span>
                  <Icon size={23} />
                  <span><strong>{phaseMeta[phase.id].label}</strong><small>{phaseMeta[phase.id].description}</small></span>
                  {isCurrent ? <b>{activePhaseMinutes} min</b> : null}
                </div>;
              })}
            </nav>

            <div className="live-workspace" data-enter>
              <article className={`live-instruction-panel phase-${presentationPhase.id.toLowerCase()}`}>
                <div className="live-panel-heading"><span>Instruções da etapa</span><b><Clock3 size={16} /> {activePhaseMinutes} min restantes</b></div>
                <div className="live-phase-title"><div className="phase-symbol"><PhaseIcon size={34} /></div><div><p className="phase-kicker">Etapa {presentationIndex + 1} de {capsule.phases.length}</p><h2 id="phase-title">{phaseMeta[presentationPhase.id].label}</h2></div></div>
                <p className="live-instruction-copy">{phaseInstruction}</p>
                <div className="live-info-banner">No final desta etapa, os dados serão automaticamente guardados no portefólio de cada aluno.</div>
              </article>
              <aside className="phase-device-card" aria-label="Tela real do Android" data-enter>
                <div className="phase-device-meta"><span>ANDROID RUNTIME</span><strong>{isSessionActive ? (isRuntimeConnected ? "AO VIVO" : "SIMULAÇÃO") : "PREVIEW"}</strong></div>
                <div className="phase-device-image"><AndroidPhasePreview phase={presentationPhase.id} /></div>
                <p>O telefone recebe apenas a capacidade desta etapa.</p>
              </aside>
            </div>

            {isSessionActive ? <div className="live-session-signals" data-enter aria-label="Estado essencial da sessão">
              <span><Users size={15} /> {demoTeacher?.studentIds.length ?? 0} alunos em aula</span>
              <span><Monitor size={15} /> Android · {runtimeDevice?.connectivity ?? "A LIGAR"}</span>
              <span><ShieldCheck size={15} /> Sentinel · {latestRuntimeEvent ? (runtimeEventLabel[latestRuntimeEvent.type] ?? latestRuntimeEvent.type) : "ÍNTEGRO"}</span>
            </div> : null}

            <div className="stage-action" data-enter>
              {!isSessionActive ? (
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
            {errorMessage ? <p className="action-error" role="alert">{errorMessage}</p> : null}
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
              {presentationPhase.id === "ANALYSE" ? <AndroidAnalysisPreview /> : <Image className="real-phone-screen" src={phaseAssets[presentationPhase.id]} alt={`Screenshot real do Android na fase ${phaseMeta[presentationPhase.id].label}`} width={420} height={933} />}
            </div>
            <p className="modal-caption">O dispositivo recebe apenas as capacidades desta etapa.</p>
          </section>
        </div>
      ) : null}
    </StudioShell>
  );
}
