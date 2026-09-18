"""Build the Morph pitch for Canva and a local animated presentation."""

from base64 import b64encode
from html import escape
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "docs" / "pitch-deck-canva.html"
ANIMATED_HTML = ROOT / "docs" / "pitch-deck-animated.html"
TEAM = ROOT / "docs" / "pitch-team.json"

html = r'''<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<title>morph — A aula programa o smartphone</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; color: #101B3A; }
  .page { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #fff; padding: 74px 104px; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .logo { width: 150px; height: auto; display: block; }
  .eyebrow { color: #287BEA; font-weight: 700; letter-spacing: 4px; font-size: 21px; }
  h1 { font-size: 86px; line-height: 1.06; letter-spacing: -3px; margin: 0; font-weight: 800; }
  h2 { font-size: 75px; line-height: 1.08; letter-spacing: -2px; margin: 0; font-weight: 800; }
  p { margin: 0; }
  .muted { color: #60708A; }
  .footer { position: absolute; left: 104px; bottom: 56px; font-size: 23px; font-weight: 700; }
  .num { position: absolute; right: 104px; bottom: 56px; font-size: 23px; color: #8C9CB2; }

  .intro { padding: 0; }
  .intro-image { position: absolute; width: 1920px; height: 1080px; object-fit: cover; }
  .intro-copy { position: absolute; left: 104px; top: 420px; width: 830px; }
  .intro-copy h1 { font-size: 82px; max-width: 820px; }
  .intro-copy p { color: #60708A; font-size: 33px; margin-top: 42px; }
  .intro .num { color: #8C9CB2; }

  .cover { padding: 0; }
  .cover-image { position: absolute; width: 1920px; height: 1080px; object-fit: cover; }
  .cover-copy { position: absolute; top: 103px; left: 104px; width: 900px; }
  .cover-copy .logo { margin-bottom: 140px; }
  .cover-copy h1 { max-width: 900px; font-size: 78px; }
  .cover-copy .lede { font-size: 39px; line-height: 1.26; max-width: 800px; margin-top: 36px; }
  .cover-copy .eyebrow { margin-bottom: 20px; }

  .slide-head { display: flex; align-items: flex-start; justify-content: space-between; }
  .slide-head .eyebrow { padding-top: 25px; }
  .headline { margin-top: 100px; max-width: 1500px; }
  .sub { font-size: 37px; line-height: 1.3; margin-top: 28px; }
  .phases { display: flex; gap: 24px; margin-top: 128px; }
  .phase { width: 25%; border-top: 5px solid #D4E3F7; padding-top: 26px; min-height: 260px; }
  .phase:nth-child(3) { border-color: #287BEA; }
  .phase .step { color: #287BEA; font-size: 24px; font-weight: 700; margin-bottom: 38px; }
  .phase .name { font-size: 30px; font-weight: 800; margin-bottom: 20px; }
  .phase .tool { font-size: 34px; font-weight: 700; line-height: 1.18; }

  .compare-title { margin-top: 70px; }
  .compare { display: flex; gap: 150px; justify-content: center; align-items: flex-start; margin-top: 46px; }
  .state { width: 630px; height: 740px; display: flex; gap: 25px; align-items: flex-start; }
  .state-copy { width: 290px; padding-top: 150px; }
  .state .phase-label { color: #287BEA; font-size: 23px; font-weight: 800; letter-spacing: 2px; }
  .state .state-title { font-size: 37px; line-height: 1.18; font-weight: 800; margin-top: 18px; }
  .state img { height: 720px; width: 325px; object-fit: contain; }

  .arch h2 { margin-top: 76px; max-width: 1600px; }
  .arch-flow { display: flex; gap: 58px; margin-top: 105px; }
  .arch-node { position: relative; height: 285px; border: 2px solid #D4E3F7; border-top: 7px solid #287BEA; border-radius: 22px; padding: 28px 27px; background: #fff; }
  .arch-node:not(:last-child)::after { content: '→'; position: absolute; right: -51px; top: 101px; color: #287BEA; font-size: 47px; font-weight: 700; }
  .arch-node:nth-child(1) { width: 330px; }
  .arch-node:nth-child(2) { width: 365px; }
  .arch-node:nth-child(3) { width: 365px; }
  .arch-node:nth-child(4) { width: 478px; }
  .arch-node .kind { color: #287BEA; font-size: 21px; font-weight: 800; letter-spacing: 2px; }
  .arch-node .name { font-size: 43px; font-weight: 800; margin-top: 28px; line-height: 1.07; }
  .arch-node .detail { color: #60708A; font-size: 27px; line-height: 1.22; margin-top: 20px; }
  .arch-tags { display: flex; gap: 14px; margin-top: 22px; }
  .arch-tags span { background: #EAF2FE; color: #2469CA; border-radius: 20px; padding: 8px 14px; font-size: 21px; font-weight: 800; }
  .arch-banner { background: #EAF2FE; color: #101B3A; padding: 28px 40px; margin-top: 47px; font-size: 32px; font-weight: 700; }
  .arch .evidence { position: absolute; bottom: 108px; left: 104px; color: #60708A; font-size: 22px; }

  .trust h2 { margin-top: 80px; max-width: 1100px; }
  .trust .points { margin-top: 70px; width: 1160px; }
  .trust .points p { font-size: 41px; line-height: 1.34; margin-bottom: 28px; font-weight: 600; }
  .trust .privacy { margin-top: 75px; font-size: 30px; max-width: 1080px; line-height: 1.3; }
  .trust-phone { position: absolute; width: 395px; height: 890px; object-fit: contain; right: 85px; top: 120px; }

  .team h2 { margin-top: 86px; }
  .team .team-lede { color: #60708A; font-size: 35px; margin-top: 32px; }
  .team-cards { display: flex; gap: 36px; margin-top: 108px; }
  .team-card { flex: 1; border-top: 5px solid #287BEA; padding-top: 42px; min-width: 0; }
  .team-card .team-name { font-size: 48px; font-weight: 800; line-height: 1.1; }
  .team-card .team-role { color: #287BEA; font-size: 28px; font-weight: 800; margin-top: 28px; }
  .team-card .team-work { color: #60708A; font-size: 28px; line-height: 1.3; margin-top: 28px; }

  body.presenting { overflow: hidden; background: #101B3A; }
  body.presenting .page { display: none; transform-origin: top left; }
  body.presenting .page.active { display: block; animation: page-in 650ms cubic-bezier(.2,.7,.2,1) both; }
  body.presenting .page.active:first-of-type { animation: none; }
  body.presenting .page.active h1, body.presenting .page.active h2 { animation: rise-in 750ms 140ms ease both; }
  body.presenting .page.active:first-of-type h1 { animation: none; }
  body.presenting .page.active .lede, body.presenting .page.active .sub, body.presenting .page.active .team-lede { animation: rise-in 750ms 320ms ease both; }
  body.presenting .page.active .phase, body.presenting .page.active .arch-node, body.presenting .page.active .team-card { animation: rise-in 600ms ease both; }
  body.presenting .page.active .phase:nth-child(1), body.presenting .page.active .arch-node:nth-child(1), body.presenting .page.active .team-card:nth-child(1) { animation-delay: 380ms; }
  body.presenting .page.active .phase:nth-child(2), body.presenting .page.active .arch-node:nth-child(2), body.presenting .page.active .team-card:nth-child(2) { animation-delay: 520ms; }
  body.presenting .page.active .phase:nth-child(3), body.presenting .page.active .arch-node:nth-child(3), body.presenting .page.active .team-card:nth-child(3) { animation-delay: 660ms; }
  body.presenting .page.active .phase:nth-child(4), body.presenting .page.active .arch-node:nth-child(4), body.presenting .page.active .team-card:nth-child(4) { animation-delay: 800ms; }
  body.presenting .page.active .state:first-child { animation: rise-in 700ms 400ms ease both; }
  body.presenting .page.active .state:last-child { animation: rise-in 700ms 700ms ease both; }
  body.presenting .page.active .arch-banner { animation: rise-in 600ms 900ms ease both; }
  @keyframes page-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes rise-in { from { opacity: 0; transform: translateY(35px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { body.presenting .page.active, body.presenting .page.active * { animation-duration: 1ms !important; } }
</style>
</head>
<body>
  <section class="page intro" data-document-role="page" data-label="morph — A aula programa o smartphone" data-speaker-notes="Bom dia. Somos a equipa Morph. Em cinco minutos vamos mostrar como uma aula pode definir o que o smartphone permite em cada momento.">
    <img class="intro-image" src="assets/intro.png" alt="Smartphone Morph com recursos de aprendizagem" />
    <div class="intro-copy"><h1>A aula programa<br>o smartphone.</h1><p>morph · Hacktudo 2026</p></div>
    <div class="num">01</div>
  </section>

  <section class="page cover" data-document-role="page" data-label="O problema: todas as aplicações ao mesmo tempo" data-speaker-notes="Na aula, o aluno pode precisar de material, calculadora ou navegador. No mesmo aparelho, redes sociais, jogos e vídeos continuam disponíveis em qualquer momento. Essa concorrência pela atenção é o problema que o Morph resolve.">
    <img class="cover-image" src="assets/cover.png" alt="Telemóvel com uma linha de transformação" />
    <div class="cover-copy">
      <img class="logo" src="assets/logo.png" alt="morph" />
      <div class="eyebrow">O PROBLEMA NA SALA DE AULA</div>
      <h1>Todas as aplicações.<br>Ao mesmo tempo.</h1>
      <p class="lede muted">Materiais de estudo, redes sociais, jogos e vídeos disputam a atenção do aluno.</p>
    </div>
    <div class="footer">morph · HACKTUDO 2026</div><div class="num">02</div>
  </section>

  <section class="page" data-document-role="page" data-label="A aula programa o smartphone" data-speaker-notes="O professor prepara as fases e escolhe as aplicações úteis. Ao tocar em Iniciar, o telemóvel dos alunos acompanha a aula. Na Física, o navegador não precisa de estar disponível em todas as fases.">
    <div class="slide-head"><img class="logo" src="assets/logo.png" alt="morph" /><div class="eyebrow">A SOLUÇÃO</div></div>
    <h2 class="headline">A aula programa o smartphone</h2>
    <p class="sub muted">As aplicações mudam porque a tarefa da aula mudou.</p>
    <div class="phases">
      <div class="phase"><div class="step">01</div><div class="name">COMPREENDER</div><div class="tool">Material da aula</div></div>
      <div class="phase"><div class="step">02</div><div class="name">MEDIR</div><div class="tool">Calculadora e notas</div></div>
      <div class="phase"><div class="step">03</div><div class="name">ANALISAR</div><div class="tool">Navegador</div></div>
      <div class="phase"><div class="step">04</div><div class="name">REFLECTIR</div><div class="tool">Conclusão</div></div>
    </div>
    <div class="footer">O mesmo telemóvel. Ferramentas adequadas a cada fase.</div><div class="num">03</div>
  </section>

  <section class="page" data-document-role="page" data-label="O mesmo navegador muda de estado" data-speaker-notes="Na fase Medir, tentamos abrir o navegador: o Morph Shield orienta o aluno de volta à atividade. O professor avança para Analisar e o navegador passa a ser uma ferramenta permitida. A demonstração ao vivo mostra a mudança.">
    <div class="slide-head"><img class="logo" src="assets/logo.png" alt="morph" /><div class="eyebrow">DEMONSTRAÇÃO NO ANDROID</div></div>
    <h2 class="compare-title">O mesmo navegador. Outra fase.</h2>
    <div class="compare">
      <div class="state"><div class="state-copy"><div class="phase-label">MEDIR</div><div class="state-title">Fora da atividade</div></div><img src="assets/shield.png" alt="Morph Shield" /></div>
      <div class="state"><div class="state-copy"><div class="phase-label">ANALISAR</div><div class="state-title">Ferramenta da aula</div></div><img src="assets/analyse.png" alt="Navegador permitido na fase Analisar" /></div>
    </div>
    <div class="footer">O professor avança a aula. O dispositivo acompanha.</div><div class="num">04</div>
  </section>

  <section class="page arch" data-document-role="page" data-label="Arquitetura do Morph" data-speaker-notes="O professor prepara e avança a aula no painel. O servidor compila e distribui um plano com as fases e aplicações permitidas. O Android guarda esse plano, valida as transições e executa a regra localmente. O Shield devolve o aluno à atividade quando tenta abrir uma aplicação fora da fase. O Sentinel guarda eventos técnicos no aparelho. Sem ligação, a fase já iniciada continua e os eventos sincronizam depois. O fluxo foi verificado num emulador Android; falta o ensaio num telefone físico.">
    <div class="slide-head"><img class="logo" src="assets/logo.png" alt="morph" /><div class="eyebrow">ARQUITETURA DO MVP</div></div>
    <h2>O plano da aula chega ao Android</h2>
    <div class="arch-flow">
      <div class="arch-node"><div class="kind">PROFESSOR</div><div class="name">Painel</div><div class="detail">Prepara e avança a aula</div></div>
      <div class="arch-node"><div class="kind">BACKEND</div><div class="name">Servidor</div><div class="detail">Cria e distribui o plano</div></div>
      <div class="arch-node"><div class="kind">CONTRATO</div><div class="name">Plano da aula</div><div class="detail">Fases e aplicações permitidas</div></div>
      <div class="arch-node"><div class="kind">NO ALUNO</div><div class="name">Android local</div><div class="detail">Valida e aplica a fase</div><div class="arch-tags"><span>Shield</span><span>Sentinel</span></div></div>
    </div>
    <div class="arch-banner">Sem Internet: a fase continua no aparelho. Eventos sincronizam depois.</div>
    <p class="evidence">MVP verificado em emulador Android · ensaio num telefone físico pendente</p>
    <div class="num">05</div>
  </section>

  <section class="page trust" data-document-role="page" data-label="O controlo termina com a aula" data-speaker-notes="Estar associado à escola não liga restrições automaticamente. O professor inicia e termina a aula. Se a Internet falhar, a fase já iniciada continua no aparelho e os eventos sincronizam depois. Ao terminar, o aluno recupera o uso normal. O Sentinel guarda eventos técnicos sem ler mensagens ou fotografias.">
    <div class="slide-head"><img class="logo" src="assets/logo.png" alt="morph" /><div class="eyebrow">USO CONSCIENTE</div></div>
    <h2>O controlo termina com a aula</h2>
    <div class="points">
      <p>O professor inicia e avança as fases.</p>
      <p>A aula continua se a Internet falhar.</p>
      <p>No intervalo, o telemóvel volta ao aluno.</p>
    </div>
    <p class="privacy muted">O Sentinel regista eventos técnicos da sessão. Não lê mensagens nem fotografias.</p>
    <img class="trust-phone" src="assets/break.png" alt="Ecrã de intervalo do Morph" />
    <div class="footer">morph · AULAS QUE TRANSFORMAM</div><div class="num">06</div>
  </section>

  <section class="page team" data-document-role="page" data-label="A equipa Morph" data-speaker-notes="__TEAM_NOTES__">
    <div class="slide-head"><img class="logo" src="assets/logo.png" alt="morph" /><div class="eyebrow">A EQUIPA</div></div>
    <h2>__TEAM_TITLE__</h2>
    <p class="team-lede">Da ideia pedagógica à demonstração no Android.</p>
    <div class="team-cards">__TEAM_CARDS__</div>
    <div class="footer">morph · A AULA PROGRAMA O SMARTPHONE</div><div class="num">07</div>
  </section>
  <script>
    const params = new URLSearchParams(location.search);
    const pages = [...document.querySelectorAll('.page')];
    const presenting = params.get('present') === '1' || location.pathname.endsWith('pitch-deck-animated.html');
    if (presenting) {
      document.body.classList.add('presenting');
      let current = 0;
      const fit = () => {
        const scale = Math.min(innerWidth / 1920, innerHeight / 1080);
        pages.forEach(page => {
          page.style.transform = `scale(${scale})`;
          page.style.left = `${(innerWidth - 1920 * scale) / 2}px`;
          page.style.top = `${(innerHeight - 1080 * scale) / 2}px`;
        });
      };
      const show = index => {
        current = Math.max(0, Math.min(index, pages.length - 1));
        pages.forEach((page, i) => page.classList.toggle('active', i === current));
      };
      addEventListener('resize', fit);
      addEventListener('keydown', event => {
        if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(current + 1); }
        if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
        if (event.key === 'Home') show(0);
        if (event.key === 'End') show(pages.length - 1);
      });
      fit(); show(0);
    } else {
      const selected = Number(params.get('slide'));
      if (selected > 0) pages.forEach((page, index) => {
        page.style.display = index + 1 === selected ? 'block' : 'none';
      });
    }
  </script>
</body>
</html>'''

assets = {
    "assets/intro.png": ROOT / "creative-outputs" / "morph-splash-portal-progression.png",
    "assets/cover.png": ROOT / "creative-outputs" / "morph-splash-16x9.png",
    "assets/logo.png": ROOT / "web" / "public" / "brand" / "logo-lockup.png",
    "assets/shield.png": ROOT / "public" / "assets" / "android" / "shield.png",
    "assets/analyse.png": ROOT / "docs" / "screenshots" / "final" / "android-emulator-analyse.png",
    "assets/break.png": ROOT / "docs" / "screenshots" / "final" / "android-emulator-break.png",
}

if TEAM.exists():
    members = json.loads(TEAM.read_text(encoding="utf-8"))
else:
    members = []

if members:
    team_title = "Quem construiu o Morph"
    team_notes = "Apresentar cada pessoa pelo nome, função e contributo."
    cards = []
    for member in members:
        name = escape(member["name"])
        role = escape(member["role"])
        work = escape(member.get("work", ""))
        cards.append(f'<div class="team-card"><div class="team-name">{name}</div><div class="team-role">{role}</div><p class="team-work">{work}</p></div>')
else:
    team_title = "A equipa por trás do Morph"
    team_notes = "A equipa reúne trabalho pedagógico, construção do painel e execução local em Android. Acrescentar os nomes quando forem confirmados."
    cards = [
        '<div class="team-card"><div class="team-name">Produto</div><div class="team-role">AULA E EXPERIÊNCIA</div><p class="team-work">Fases pedagógicas e uso pelo professor.</p></div>',
        '<div class="team-card"><div class="team-name">Painel web</div><div class="team-role">CONTROLO DA AULA</div><p class="team-work">Plano, início e avanço das fases.</p></div>',
        '<div class="team-card"><div class="team-name">Android</div><div class="team-role">EXECUÇÃO LOCAL</div><p class="team-work">Aplicações permitidas, Shield e trabalho offline.</p></div>',
    ]

html = html.replace("__TEAM_TITLE__", team_title)
html = html.replace("__TEAM_NOTES__", escape(team_notes, quote=True))
html = html.replace("__TEAM_CARDS__", "".join(cards))
standalone = html
for name, path in assets.items():
    encoded = b64encode(path.read_bytes()).decode("ascii")
    standalone = standalone.replace(f'src="{name}"', f'src="data:image/png;base64,{encoded}"')
HTML.write_text(standalone, encoding="utf-8")
ANIMATED_HTML.write_text(standalone, encoding="utf-8")
print(HTML)
print(ANIMATED_HTML)
