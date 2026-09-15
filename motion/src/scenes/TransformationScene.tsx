import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

const screens = [
  { asset: "assets/android/understand.png", title: "COMPREENDER", copy: "Explorar o fenómeno no contexto real.", number: "01" },
  { asset: "assets/android/shield.png", title: "SHIELD", copy: "Voltar ao foco quando a aula pede atenção.", number: "02" },
  { asset: "assets/android/measure.png", title: "MEDIR", copy: "Usar os sensores do telefone para recolher dados.", number: "03" },
];

export const TransformationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const active = frame < 58 ? 0 : frame < 116 ? 1 : 2;
  const localFrame = frame < 58 ? frame : frame < 116 ? frame - 58 : frame - 116;
  const stage = screens[active];
  const copyIn = interpolate(localFrame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const phoneIn = interpolate(localFrame, [0, 18], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const phoneX = interpolate(localFrame, [0, 18], [48, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const copyX = interpolate(localFrame, [0, 14], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="transform-grid" />
      <div className="transform-header"><Img className="transform-lockup" src={staticFile("brand/morph-lockup.jpg")} /><div className="transform-meta">A MESMA AULA <span>·</span> TRÊS FUNÇÕES</div></div>
      <div className="transform-main">
        <div className="transform-copy" style={{ opacity: copyIn, translate: `${copyX}px 0` }}>
          <div className="eyebrow">AULA AO VIVO <span /></div>
          <h2>Na mesma aula,<br />o telefone <em>muda de função.</em></h2>
          <p>Da intenção pedagógica à experiência executável no smartphone.</p>
          <div className="stage-detail"><strong>{stage.number} / {stage.title}</strong><span>{stage.copy}</span></div>
        </div>
        <div className="transform-device" style={{ opacity: copyIn, scale: phoneIn, translate: `${phoneX}px 0` }}><div className="device-shadow" /><Img className="transform-phone" src={staticFile(stage.asset)} /></div>
      </div>
      <div className="transform-rail">{screens.map((item, index) => <div className={`rail-item ${index === active ? "active" : ""}`} key={item.title}><span className="rail-number">{item.number}</span><span>{item.title}</span></div>)}</div>
      <div className="transform-footer">MORPH <span>·</span> TECNOLOGIA A SERVIÇO DE UMA APRENDIZAGEM MAIS CONSCIENTE.</div>
    </AbsoluteFill>
  );
};
