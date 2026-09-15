import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Download,
  Gauge,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WifiOff
} from "lucide-react";

const actors = [
  {
    number: "01",
    title: "A escola cria o contexto",
    description: "Define a School Bubble, organiza a comunidade e atribui a cada professor as turmas sob a sua responsabilidade.",
    icon: Building2,
    detail: "Campus, pessoas e relações"
  },
  {
    number: "02",
    title: "O professor conduz a aula",
    description: "Transforma a intenção pedagógica numa Capsule e muda a fase quando a aprendizagem pede uma nova ferramenta.",
    icon: GraduationCap,
    detail: "Fases, capacidades e ritmo"
  },
  {
    number: "03",
    title: "O aluno aprende no dispositivo",
    description: "Recebe apenas as capacidades da aula activa. O telemóvel deixa de ser genérico e torna-se uma ferramenta de aprendizagem.",
    icon: Smartphone,
    detail: "Runtime local e offline-first"
  }
];

const phases = [
  ["01", "Compreender", "Conteúdo e orientação"],
  ["02", "Medir", "Sensores e experiência"],
  ["03", "Analisar", "Dados, gráfico e cálculo"],
  ["04", "Reflectir", "Conclusão individual"]
];

export function MorphLanding() {
  return (
    <main className="landing-shell">
      <header className="landing-nav">
        <Link href="/" className="landing-brand" aria-label="Morph, página inicial">
          <Image src="/brand/morph-lockup.jpg" alt="morph · aulas que transformam" width={198} height={56} priority />
        </Link>
        <nav aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#intervenientes">Intervenientes</a>
          <a href="#apk">APK demo</a>
        </nav>
        <Link href="/teacher" className="landing-nav-action">Entrar no studio <ArrowRight size={15} /></Link>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow"><span /> MORPH · HACKTUDO 2026</p>
          <h1 id="landing-title">A aula<br />transforma o<br /><em>smartphone.</em></h1>
          <p className="landing-lead">A Morph liga escola, professor e aluno para que cada fase da aula dê ao dispositivo exactamente a capacidade certa.</p>
          <div className="landing-actions">
            <Link href="/teacher" className="landing-primary">Explorar o studio do professor <ArrowRight size={18} /></Link>
            <a href="#como-funciona" className="landing-secondary">Ver a ideia <span>↓</span></a>
          </div>
          <div className="landing-proof">
            <span><CheckCircle2 size={16} /> Sem vigilância de conteúdo</span>
            <span><WifiOff size={16} /> Continua offline</span>
          </div>
        </div>

        <div className="landing-hero-art" aria-label="Escola, professor e aluno ligados pela Morph" style={{ position: "relative" }}>
          <Image src="/media/morph-ecosystem-hero.png" alt="Ilustração de uma escola, professor e aluno ligados por um smartphone Morph" fill priority sizes="(max-width: 900px) 100vw, 60vw" />
          <div className="hero-float hero-float-school"><MapPin size={16} /><span><strong>School Bubble</strong>Campus Horizonte</span></div>
          <div className="hero-float hero-float-session"><span className="live-dot" /><span><strong>Aula activa</strong>Física · 10.º A</span></div>
          <div className="hero-float hero-float-phase"><Gauge size={16} /><span><strong>Fase 02</strong>Medir</span></div>
        </div>
      </section>

      <section className="landing-intro-band">
        <p>O smartphone não é um problema para gerir.</p>
        <strong>É uma capacidade pedagógica para activar.</strong>
        <Sparkles size={21} />
      </section>

      <section className="landing-section landing-actors" id="intervenientes" aria-labelledby="actors-title">
        <div className="landing-section-heading">
          <p className="landing-eyebrow"><span /> TRÊS INTERVENIENTES, UMA AULA</p>
          <h2 id="actors-title">Uma autoridade clara.<br />Uma aprendizagem livre para acontecer.</h2>
          <p>A Morph separa contexto, condução pedagógica e execução local — sem transformar a escola num sistema de vigilância.</p>
        </div>
        <div className="actor-grid">
          {actors.map(({ number, title, description, detail, icon: Icon }) => (
            <article className="actor-card" key={number}>
              <div className="actor-card-top"><span>{number}</span><Icon size={24} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="actor-card-detail">{detail}<ArrowRight size={15} /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-system" id="como-funciona" aria-labelledby="system-title">
        <div className="system-copy">
          <p className="landing-eyebrow landing-eyebrow-light"><span /> A SCHOOL BUBBLE</p>
          <h2 id="system-title">A escola define onde a aprendizagem ganha contexto.</h2>
          <p>Dentro do campus, uma aula válida e iniciada pelo professor transforma a Capsule numa experiência activa no dispositivo do aluno.</p>
          <div className="system-guarantees">
            <div><ShieldCheck size={19} /><span><strong>Privacidade por princípio</strong>A Morph verifica a política, não o conteúdo pessoal.</span></div>
            <div><WifiOff size={19} /><span><strong>Offline é uma promessa</strong>Capsule, capacidades e eventos continuam localmente.</span></div>
          </div>
        </div>
        <div className="bubble-diagram" aria-label="Diagrama School Bubble">
          <div className="bubble-boundary bubble-boundary-outer" />
          <div className="bubble-boundary bubble-boundary-inner" />
          <div className="bubble-node bubble-school"><Building2 size={25} /><strong>Escola</strong><small>School Bubble</small></div>
          <div className="bubble-node bubble-teacher"><GraduationCap size={23} /><strong>Professor</strong><small>Aula activa</small></div>
          <div className="bubble-node bubble-student"><Smartphone size={23} /><strong>Aluno</strong><small>Runtime local</small></div>
          <div className="bubble-caption">Contexto + aula + Capsule</div>
        </div>
      </section>

      <section className="landing-section landing-phases" aria-labelledby="phases-title">
        <div className="landing-section-heading compact-heading">
          <p className="landing-eyebrow"><span /> A AULA PROGRAMA O DISPOSITIVO</p>
          <h2 id="phases-title">Cada etapa muda o que o aluno pode fazer.</h2>
        </div>
        <div className="phase-rail">
          {phases.map(([number, title, detail], index) => (
            <article className={index === 1 ? "landing-phase active-phase" : "landing-phase"} key={number}>
              <span>{number}</span><div className="phase-node"><span /></div><h3>{title}</h3><p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-download" id="apk" aria-labelledby="download-title">
        <div>
          <p className="landing-eyebrow"><span /> EXPERIMENTE A IDEIA</p>
          <h2 id="download-title">Uma Capsule. Um dispositivo que muda de função.</h2>
          <p>Instale a demonstração Android e veja o runtime Morph passar de conteúdo para instrumento de medição.</p>
          <div className="download-meta"><span>APK demo</span><span>Android 8+</span><span>Offline-first</span></div>
        </div>
        <div className="download-actions"><a className="landing-primary" href="/downloads/morph-demo.apk" download><Download size={18} /> Baixar APK demo</a><Link className="download-text-link" href="/teacher">Ou entrar como professor <ArrowRight size={16} /></Link></div>
      </section>

      <section className="landing-access" aria-labelledby="access-title">
        <div><p className="landing-eyebrow"><span /> PROTÓTIPO HACKATHON</p><h2 id="access-title">Entre em cada papel.</h2></div>
        <div className="access-options">
          <Link href="/school" className="access-option"><Building2 size={22} /><span><strong>Painel da escola</strong><small>School Bubble, pessoas e turmas</small></span><ArrowRight size={18} /></Link>
          <Link href="/teacher" className="access-option"><GraduationCap size={22} /><span><strong>Studio do professor</strong><small>Capsules, fases e aula ao vivo</small></span><ArrowRight size={18} /></Link>
        </div>
      </section>

      <footer className="landing-footer"><Image src="/brand/morph-lockup.jpg" alt="morph" width={142} height={40} /><p>AULAS QUE TRANSFORMAM · HACKTUDO 2026</p><a href="#landing-title">Voltar ao início ↑</a></footer>
    </main>
  );
}
