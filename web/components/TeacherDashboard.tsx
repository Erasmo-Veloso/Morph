"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import gsap from "gsap";
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
import type { RuntimeStatus } from "@/lib/runtime-bridge";

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

type ApiResponse = { session?: LessonSession } & Partial<CompileResult>;

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

const splashStages = [
  { id: "UNDERSTAND" as const, number: "01", label: "COMPREENDER", title: "Compreender", detail: "Explora o fenómeno e regista a tua hipótese." },
  { id: "SHIELD" as const, number: "02", label: "SHIELD", title: "Morph Shield", detail: "O telefone protege o foco quando a aula pede atenção." },
  { id: "MEASURE" as const, number: "03", label: "MEDIR", title: "Experimentar", detail: "O acelerómetro recolhe dados do movimento real." }
];

function TransformationSplash() {
  const [activeStage, setActiveStage] = useState(0);
  const screenRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);
  const stage = splashStages[activeStage]!;

  useEffect(() => {
    const timer = window.setInterval(() => setActiveStage((current) => (current + 1) % splashStages.length), 2400);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.fromTo(screenRef.current, { autoAlpha: 0, y: 12, scale: .97 }, { autoAlpha: 1, y: 0, scale: 1, duration: .48, ease: "power2.out" });
      gsap.fromTo(pulseRef.current, { scale: .7, autoAlpha: .35 }, { scale: 1.45, autoAlpha: 0, duration: 1.1, repeat: 1, ease: "power1.out" });
    }, screenRef);
    return () => context.revert();
  }, [activeStage]);

  return <div className="intent-device-code" aria-label="Demonstração codificada da metamorfose do Android">
    <div className="splash-device-copy">
      <span className="stage-eyebrow">Aula ao vivo <span /></span>
      <h2>A mesma aula.<br /><em>Três funções.</em></h2>
      <p>O telefone começa por ensinar, protege o foco e depois mede o fenómeno.</p>
      <div className="splash-stage-tabs" role="tablist" aria-label="Fases da demonstração">
        {splashStages.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={index === activeStage} className={index === activeStage ? "active" : ""} onClick={() => setActiveStage(index)}><span>{item.number}</span>{item.label}</button>)}
      </div>
    </div>
    <div className="splash-device-visual">
      <div className="splash-signal" aria-hidden="true"><span ref={pulseRef} /></div>
      <div className="splash-phone" ref={screenRef} data-stage={stage.id}>
        <div className="splash-phone-status"><span>11:52</span><span>5G&nbsp; · &nbsp;▮</span></div>
        <div className="splash-phone-brand"><span className="splash-mark">M</span><strong>morph</strong></div>
        <div className="splash-phone-runtime"><span>● EM AULA</span><i>·</i><span>● ONLINE</span></div>
        {stage.id === "UNDERSTAND" && <div className="splash-screen-content"><span className="splash-kicker">CAPSULE · 01 / 04</span><h3>Compreender</h3><p>O telefone certo para cada momento da aula.</p><span className="splash-rule" /><div className="splash-content-card"><strong>Qual é a tua hipótese?</strong><span /><span /><span /></div></div>}
        {stage.id === "SHIELD" && <div className="splash-screen-content splash-shield-content"><span className="splash-kicker">MORPH SHIELD</span><div className="splash-shield-icon">↗</div><h3>Vamos de volta<br />à aula?</h3><p>O foco ajuda-te a ir mais longe.</p><button type="button">Continuar a aprender</button></div>}
        {stage.id === "MEASURE" && <div className="splash-screen-content"><span className="splash-kicker">CAPSULE · 03 / 04</span><h3>Medir</h3><p>Dados do movimento.</p><span className="splash-rule" /><div className="splash-measure-card"><strong>Acelerómetro real</strong><b>3.74</b><div className="splash-chart" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><small>m/s²&nbsp; · &nbsp;dados recolhidos pelo dispositivo</small></div></div>}
        <div className="splash-phone-progress">{splashStages.map((item, index) => <span key={item.id} className={index <= activeStage ? "done" : ""} />)}</div>
      </div>
      <div className="splash-stage-caption"><strong>{stage.number} / {stage.title}</strong><span>{stage.detail}</span></div>
    </div>
  </div>;
}

export function TeacherDashboard({ initialCapsule }: { initialCapsule: LearningCapsule }) {
  const [intent, setIntent] = useState(defaultIntent);
  const [capsule, setCapsule] = useState(initialCapsule);
  const [session, setSession] = useState<LessonSession | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [view, setView] = useState<"intent" | "configure" | "present">("intent");
  const [selectedPhaseId, setSelectedPhaseId] = useState<PhaseId>("UNDERSTAND");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
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

  const activePhase = useMemo(() => {
    if (!session || session.currentPhase === "COMPLETED") return null;
    return capsule.phases.find((phase) => phase.id === session.currentPhase) ?? null;
  }, [capsule.phases, session]);

  const selectedPhase = capsule.phases.find((phase) => phase.id === selectedPhaseId) ?? capsule.phases[0]!;
  const presentationPhase = activePhase ?? selectedPhase;
  const presentationIndex = capsule.phases.findIndex((phase) => phase.id === presentationPhase.id);
  const isLastPhase = presentationIndex === capsule.phases.length - 1;
  const PhaseIcon = phaseMeta[presentationPhase.id].icon;
  const runtimeDevice = runtimeStatus?.devices.at(-1);
  const latestRuntimeEvent = runtimeStatus?.events.at(-1);

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
      if (result.capsule) setCapsule(result.capsule);
      if (result.session) setSession(result.session);
      return result;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível concluir esta acção.");
      return null;
    } finally {
      setIsBusy(false);
    }
  }

  async function compileLesson() {
    const result = await runAction(() => postJson("/api/compile", { intent }));
    if (!result) return;
    setSelectedPhaseId("UNDERSTAND");
    setView("configure");
  }

  async function startSimulation() {
    await runAction(() => postJson("/api/session/start"));
  }

  async function advanceSimulation() {
    if (isLastPhase) {
      const result = await runAction(() => postJson("/api/session/end"));
      if (!result) return;
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
    const result = await runAction(() => postJson("/api/capsule", { capsule }));
    if (!result) return;
    setView("present");
  }

  const isRuntimeConnected = Boolean(runtimeDevice);

  return (
    <main className="presentation-shell">
      <header className="presentation-header">
        <a className="brand" href="#presentation" aria-label="morph">
          <Image src="/brand/morph-lockup.jpg" alt="morph · aulas que transformam" width={210} height={58} priority />
        </a>
        <div className="header-context"><span>TEACHER STUDIO</span><strong>HACKTUDO 2026</strong></div>
        <div className="header-status">
          <span className="status-dot" />
          <span>{runtimeDevice ? `Android · ${runtimeDevice.connectivity}` : "Aguardando Android"}</span>
        </div>
        <button className="preview-trigger" type="button" onClick={() => setIsPreviewOpen(true)}>
          <Eye size={16} /> Ver dispositivo
        </button>
      </header>

      <section className="presentation" id="presentation" ref={presentationRef}>
        {view === "intent" ? (
          <section className="intent-stage" aria-labelledby="intent-title">
            <div className="stage-copy" data-enter>
              <p className="stage-eyebrow">Passo 01 <span /> Intenção pedagógica</p>
              <h1 id="intent-title">O que os alunos vão aprender hoje?</h1>
              <p>Descreva a aula. A Morph transforma a sua intenção numa experiência executável no telefone.</p>
            </div>
            <div className="intent-composer" data-enter>
              <div className="composer-heading"><div><span className="composer-kicker">Criar Capsule</span><strong>Uma aula. Quatro funções.</strong></div><span className="composer-index">01</span></div>
              <label htmlFor="lesson-intent">Descreve a aula que queres dar</label>
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
              <div className="intent-proof">
                <div className="proof-copy"><span>O mesmo smartphone</span><strong>metamorfoseia-se em cada fase.</strong></div>
                <div className="proof-rail" aria-label="Fases da Capsule">
                  {capsule.phases.map((phase, index) => <span className={index === 0 ? "proof-node active" : "proof-node"} key={phase.id}><i />{phaseMeta[phase.id].label}</span>)}
                </div>
              </div>
            </div>
            <aside className="intent-device" aria-label="Ecrãs reais do Android" data-enter>
              <TransformationSplash />
            </aside>
          </section>
        ) : view === "configure" ? (
          <section className="configuration-stage" aria-labelledby="configuration-title">
            <div className="configuration-heading" data-enter>
              <p className="stage-eyebrow">Passo 02 <span /> Configurar a Cápsula</p>
              <h1 id="configuration-title">Defina o que o telefone pode fazer em cada etapa.</h1>
              <p>As aplicações seleccionadas tornam-se capacidades disponíveis apenas durante a etapa escolhida.</p>
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

            <div className="configuration-action" data-enter><button className="main-action" type="button" disabled={isBusy} onClick={confirmCapsule}>{isBusy ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />} Confirmar Cápsula</button><span>As suas escolhas serão enviadas para o Android local runtime.</span></div>
            {errorMessage ? <p className="action-error" role="alert">{errorMessage}</p> : null}
          </section>
        ) : (
          <section className="phase-stage" aria-labelledby="phase-title">
            <div className="phase-stage-top" data-enter>
              <p className="stage-eyebrow">Learning Capsule <span /> Movimento acelerado</p>
              <span className="phase-count">Etapa {presentationIndex + 1} de {capsule.phases.length}</span>
            </div>

            <div className="phase-demo-layout">
              <div className={`phase-focus phase-${presentationPhase.id.toLowerCase()}`} data-enter>
                <div className="phase-symbol"><PhaseIcon size={38} /></div>
                <p className="phase-kicker">{session ? "Fase ativa" : "Cápsula compilada"}</p>
                <h1 id="phase-title">{phaseMeta[presentationPhase.id].label}</h1>
                <p className="phase-description">{phaseMeta[presentationPhase.id].description}</p>
                <div className="phase-detail"><FileCode2 size={17} /> {phaseMeta[presentationPhase.id].detail}</div>
              </div>
              <aside className="phase-device-card" aria-label="Tela real do Android" data-enter>
                <div className="phase-device-meta"><span>ANDROID RUNTIME</span><strong>{session ? (isRuntimeConnected ? "AO VIVO" : "SIMULAÇÃO") : "PREVIEW"}</strong></div>
                <div className="phase-device-image"><AndroidPhasePreview phase={presentationPhase.id} /></div>
                <p>O telefone recebe apenas a capacidade desta etapa.</p>
              </aside>
            </div>

            <nav className="phase-navigation" aria-label="Etapas da aula" data-enter>
              {capsule.phases.map((phase, index) => {
                const isCurrent = phase.id === presentationPhase.id;
                return <div className={isCurrent ? "phase-nav-item current" : "phase-nav-item"} key={phase.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{phaseMeta[phase.id].label}</strong>
                  {index < capsule.phases.length - 1 ? <ChevronRight size={16} /> : null}
                </div>;
              })}
            </nav>

            <div className="stage-action" data-enter>
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
            {session ? <section className="runtime-live" aria-label="Estado real do Android" data-enter>
              <div><span>Android</span><strong>{runtimeDevice?.phase ?? "A AGUARDAR DEVICE"}</strong></div>
              <div><span>Conectividade</span><strong>{runtimeDevice?.connectivity ?? "SEM DISPOSITIVO"}</strong></div>
              <div><span>Sentinel</span><strong>{latestRuntimeEvent?.type ?? "SEM EVENTOS"}</strong></div>
            </section> : null}
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
    </main>
  );
}
