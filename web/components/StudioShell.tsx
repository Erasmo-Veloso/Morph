import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  Home,
  Library,
  Search,
  Settings,
  Smartphone,
  Users
} from "lucide-react";

type StudioSection = "home" | "capsules" | "classes" | "library" | "devices" | "reports";

const navigation: Array<{ id: StudioSection; label: string; href: string; icon: typeof Home }> = [
  { id: "home", label: "Início", href: "/", icon: Home },
  { id: "capsules", label: "Cápsulas", href: "/teacher", icon: BookOpen },
  { id: "classes", label: "Turmas", href: "/school", icon: Users },
  { id: "library", label: "Biblioteca", href: "/", icon: Library },
  { id: "devices", label: "Dispositivos", href: "/school", icon: Smartphone },
  { id: "reports", label: "Relatórios", href: "/school", icon: BarChart3 }
];

export function StudioShell({
  active,
  children,
  status = "Aguardando Android"
}: {
  active: StudioSection;
  children: React.ReactNode;
  status?: string;
}) {
  return <main className="studio-shell">
    <aside className="studio-sidebar">
      <Link className="studio-brand" href="/" aria-label="Morph, página inicial">
        <Image src="/brand/morph-lockup.jpg" alt="morph" width={170} height={48} priority />
      </Link>
      <nav className="studio-nav" aria-label="Navegação principal">
        {navigation.map(({ id, label, href, icon: Icon }) => <Link className={active === id ? "studio-nav-item active" : "studio-nav-item"} href={href} key={id}>
          <Icon size={20} strokeWidth={active === id ? 2.4 : 1.8} /><span>{label}</span>
        </Link>)}
      </nav>
      <div className="studio-sidebar-note"><strong>Aprendizagem<br />sem limites.</strong><span>Tecnologia e curiosidade para uma educação mais humana.</span></div>
      <div className="studio-profile"><span className="studio-avatar">MR</span><span><strong>Maria Ribeiro</strong><small>Professora</small></span><ChevronDown size={16} /></div>
    </aside>
    <section className="studio-main">
      <header className="studio-topbar">
        <label className="studio-search"><Search size={18} /><input aria-label="Pesquisar" placeholder="Pesquisar cápsulas, turmas ou recursos..." /></label>
        <div className="studio-topbar-actions"><span className="studio-live-status"><span />{status}</span><button className="studio-icon-button" type="button" aria-label="Notificações"><Bell size={20} /><i /></button><span className="studio-divider" /><span className="studio-account"><span className="studio-avatar">MR</span><span><strong>Maria Ribeiro</strong><small>Escola Secundária do Porto</small></span><ChevronDown size={16} /></span></div>
      </header>
      <div className="studio-page">{children}</div>
    </section>
  </main>;
}

export function StudioSectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="studio-section-label">{children}<span /></p>;
}
