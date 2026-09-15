"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, CheckCircle2, CircleAlert, LocateFixed, MapPin, PackagePlus, Plus, Save, ShieldCheck, Users } from "lucide-react";
import type { SchoolBubble } from "@/lib/capsule";
import type { SchoolApp, SchoolConfig } from "@/lib/school-store";
import type { RuntimeStatus } from "@/lib/runtime-bridge";

const SchoolBubbleMap = dynamic(() => import("./SchoolBubbleMap").then((module) => module.SchoolBubbleMap), {
  ssr: false,
  loading: () => <div className="school-map-loading">A carregar mapa do campus…</div>
});

const fallbackBubble: SchoolBubble = {
  id: "bubble-horizonte-main",
  school_id: "school-horizonte",
  name: "Campus Horizonte",
  boundary: { type: "CIRCLE", center: { latitude: -8.8383, longitude: 13.2344 }, radius_meters: 180 },
  policy: { gps_required: true, max_accuracy_meters: 100, unknown_location_grace_seconds: 300 }
};

export function SchoolDashboard() {
  const [school, setSchool] = useState<SchoolConfig | null>(null);
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [bubble, setBubble] = useState<SchoolBubble>(fallbackBubble);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [appName, setAppName] = useState("");
  const [appCategory, setAppCategory] = useState("PERSONALIZADA");
  const [appPackages, setAppPackages] = useState("");
  const [message, setMessage] = useState("Clique no mapa para definir o centro real do campus.");

  useEffect(() => {
    void fetch("/api/school", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { school?: SchoolConfig }) => {
        if (!payload.school) return;
        setSchool(payload.school);
        setBubble(payload.school.bubble);
      })
      .catch(() => setMessage("A configuração local da escola ficará disponível quando o servidor iniciar."));
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const response = await fetch("/api/runtime/status", { cache: "no-store" }).catch(() => null);
      if (!response?.ok) return;
      const status = await response.json() as RuntimeStatus;
      if (active) setRuntime(status);
    };
    void refresh();
    const timer = window.setInterval(refresh, 1500);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const studentCount = school?.students.length ?? 0;
  const selectedTeacher = school?.teachers[0];
  const bubbleLabel = useMemo(() => `${bubble.boundary.center.latitude.toFixed(5)}, ${bubble.boundary.center.longitude.toFixed(5)}`, [bubble]);

  function updateBubble(changes: Partial<SchoolBubble>) {
    setBubble((current) => ({ ...current, ...changes }));
  }

  async function saveBubble() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/school", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ bubble }) });
      const payload = await response.json() as { school?: SchoolConfig; error?: string };
      if (!response.ok || !payload.school) throw new Error(payload.error ?? "Não foi possível guardar a School Bubble.");
      setSchool(payload.school);
      setBubble(payload.school.bubble);
      setMessage("School Bubble guardada. As próximas Capsules incluirão esta regra local.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível guardar a School Bubble.");
    } finally {
      setIsSaving(false);
    }
  }

  async function addApp() {
    setIsAddingApp(true);
    try {
      const app: SchoolApp = {
        id: appName,
        name: appName,
        category: appCategory,
        package_names: appPackages.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)
      };
      const response = await fetch("/api/school", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ app }) });
      const payload = await response.json() as { school?: SchoolConfig; error?: string };
      if (!response.ok || !payload.school) throw new Error(payload.error ?? "Não foi possível adicionar a aplicação.");
      setSchool(payload.school);
      setAppName("");
      setAppCategory("PERSONALIZADA");
      setAppPackages("");
      setMessage("Aplicação adicionada ao catálogo. O professor já a pode autorizar por etapa.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível adicionar a aplicação.");
    } finally {
      setIsAddingApp(false);
    }
  }

  return <main className="school-shell">
    <header className="school-nav"><Link href="/" className="landing-brand"><Image src="/brand/morph-lockup.jpg" alt="morph" width={176} height={50} priority /></Link><div className="school-nav-title"><span>PAINEL DA ESCOLA</span><strong>{school?.name ?? "Colégio Horizonte"}</strong></div><Link href="/teacher" className="school-teacher-link">Abrir studio do professor <ArrowRight size={15} /></Link></header>

    <section className="school-hero"><div><p className="landing-eyebrow"><span /> VISÃO DA SCHOOL BUBBLE</p><h1>O contexto certo<br />para cada aula.</h1><p>A escola define uma área pedagógica, associa a comunidade e entrega uma regra que o dispositivo poderá executar localmente.</p></div><div className="school-health"><span className="live-dot" /><strong>School Bubble pronta para demo</strong><small>GPS será validado após o pitch</small></div></section>

    <section className="school-metrics" aria-label="Indicadores da escola"><article><Building2 size={21} /><span><strong>01</strong><small>campus configurado</small></span></article><article><Users size={21} /><span><strong>{school?.teachers.length ?? 0}</strong><small>professores activos</small></span></article><article><CheckCircle2 size={21} /><span><strong>{studentCount}</strong><small>alunos associados</small></span></article><article><ShieldCheck size={21} /><span><strong>{bubble.boundary.radius_meters} m</strong><small>raio pedagógico</small></span></article></section>

    <section className="school-grid school-grid-bubble">
      <article className="school-card school-bubble-card school-bubble-editor">
        <div className="school-card-header"><div><p>CONFIGURAÇÃO REAL</p><h2>Definir a School Bubble</h2></div><span className="school-tag">GPS LOCAL</span></div>
        <div className="school-bubble-controls">
          <label>Nome da Bubble<input value={bubble.name} onChange={(event) => updateBubble({ name: event.target.value })} /></label>
          <label>Raio pedagógico <span>{bubble.boundary.radius_meters} m</span><input type="range" min="50" max="1000" step="10" value={bubble.boundary.radius_meters} onChange={(event) => setBubble((current) => ({ ...current, boundary: { ...current.boundary, radius_meters: Number(event.target.value) } }))} /></label>
          <div className="bubble-coordinate"><LocateFixed size={16} /><span><strong>Centro seleccionado</strong>{bubbleLabel}</span></div>
        </div>
        <SchoolBubbleMap bubble={bubble} onCenterChange={(center) => setBubble((current) => ({ ...current, boundary: { ...current.boundary, center } }))} />
        <div className="bubble-editor-footer"><p><MapPin size={15} /> {message}</p><button type="button" onClick={saveBubble} disabled={isSaving}><Save size={16} /> {isSaving ? "A guardar…" : "Guardar School Bubble"}</button></div>
      </article>

      <aside className="school-card school-policy-card"><div className="school-card-header"><div><p>MODO PITCH</p><h2>Como a demo corre</h2></div><CircleAlert size={20} /></div><ol className="school-policy-list"><li><span>01</span><div><strong>Recebe a Capsule</strong><small>A Bubble configurada é incluída numa cópia local e assinável.</small></div></li><li><span>02</span><div><strong>Confirmação imediata</strong><small>No APK de pitch, a Bubble fica pronta sem pedir ou esperar GPS.</small></div></li><li><span>03</span><div><strong>Activa a aula</strong><small>O professor pode iniciar e avançar pelas capacidades sem atraso.</small></div></li><li><span>04</span><div><strong>GPS fica preparado</strong><small>Raio, precisão e tolerância de {Math.round(bubble.policy.unknown_location_grace_seconds / 60)} min. permanecem no contrato para a próxima fase.</small></div></li></ol><div className="school-policy-note"><ShieldCheck size={17} /> Demonstração sem rastreamento nem permissões de localização. A validação GPS será ligada depois do pitch.</div></aside>
    </section>

    <section className="school-card school-people-card"><div className="school-card-header"><div><p>COMUNIDADE AUTORIZADA</p><h2>Professor, turma e alunos da demonstração</h2></div><span className="school-tag">DEMO SEM LOGIN</span></div><div className="teacher-list">{(school?.teachers ?? []).map((teacher) => <div className={teacher.id === selectedTeacher?.id ? "teacher-row selected-teacher" : "teacher-row"} key={teacher.id}><div className="teacher-avatar">{teacher.name.split(" ").slice(1, 3).map((part) => part[0]).join("")}</div><div><strong>{teacher.name}</strong><small>{teacher.subject} · {teacher.className}</small></div><span>{teacher.studentIds.length} alunos</span><CheckCircle2 size={18} /></div>)}</div>{selectedTeacher ? <div className="school-assignment"><Users size={17} /><span><strong>{selectedTeacher.name}</strong> pode iniciar Capsules para {selectedTeacher.className}; o runtime de <strong>Aluno demo</strong> reconhece essa relação para a demonstração.</span><Link href="/teacher">Abrir aula <ArrowRight size={15} /></Link></div> : null}<div className="school-assignment"><PackagePlus size={17} /><span><strong>Dispositivo principal</strong> · {runtime?.enrollment?.state === "PAIRED" ? `${runtime.enrollment.deviceName ?? "Android Morph"} associado a ${runtime.enrollment.studentName}.` : `Introduza o código ${runtime?.enrollment?.pairingCode ?? "MORPH-2026"} no Android para associar o Aluno demo.`} <small>Uma associação é suficiente para esta demo.</small></span><span className="school-tag">{runtime?.enrollment?.state ?? "PENDING"}</span></div></section>

    <section className="school-card school-catalog-card"><div className="school-card-header"><div><p>CATÁLOGO PEDAGÓGICO</p><h2>Aplicações aprovadas pela escola</h2></div><span className="school-tag blue-tag">{(school?.appCatalog ?? []).length} APLICAÇÕES</span></div><p className="school-catalog-intro">O professor escolhe apenas deste catálogo para cada etapa. Os packages seguem dentro da Capsule para o runtime aplicar a regra localmente.</p><div className="school-catalog-list">{(school?.appCatalog ?? []).map((app) => <article key={app.id}><PackagePlus size={17} /><div><strong>{app.name}</strong><small>{app.category} · {app.package_names.length} package{app.package_names.length === 1 ? "" : "s"}</small></div><span>{app.description ?? "Aplicação aprovada"}</span></article>)}</div><form className="school-add-app" onSubmit={(event) => { event.preventDefault(); void addApp(); }}><div><label>Nome<input value={appName} onChange={(event) => setAppName(event.target.value)} placeholder="Ex.: GeoGebra" required /></label><label>Categoria<input value={appCategory} onChange={(event) => setAppCategory(event.target.value)} /></label></div><label>Packages Android <small>um ou mais, separados por vírgula</small><input value={appPackages} onChange={(event) => setAppPackages(event.target.value)} placeholder="org.geogebra.android" required /></label><button type="submit" disabled={isAddingApp}><Plus size={16} /> {isAddingApp ? "A adicionar…" : "Adicionar ao catálogo"}</button></form></section>
    <footer className="school-footer"><Link href="/">← Voltar à landing</Link><span>Protótipo hackathon: as associações são dados demonstráveis; autenticação e gestão multi-escola ficam para a fase seguinte.</span></footer>
  </main>;
}
