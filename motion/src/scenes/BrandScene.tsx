import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export const BrandScene: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const phone = interpolate(frame, [4, 28], [0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const copyX = interpolate(frame, [0, 18], [-24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const phoneX = interpolate(frame, [0, 24], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5f7fc", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="grid-paper" />
      <div className="brand-topline">MORPH <span>/</span> HACKTUDO 2026</div>
      <div className="brand-copy" style={{ opacity: intro, translate: `${copyX}px 0` }}>
        <Img className="lockup" src={staticFile("brand/morph-lockup.jpg")} />
        <div className="eyebrow">TECNOLOGIA COM PROPÓSITO NA EDUCAÇÃO</div>
        <h1>O smartphone<br /><em>metamorfoseia-se</em><br />conforme a aprendizagem.</h1>
        <p>Uma aula. Diferentes propósitos. O mesmo dispositivo.</p>
      </div>
      <div className="brand-phone-wrap" style={{ opacity: intro, scale: phone, translate: `${phoneX}px 0` }}>
        <div className="phone-halo" />
        <Img className="hero-phone" src={staticFile("assets/android/understand.png")} />
        <div className="phone-caption"><span>01</span> COMPREENDER</div>
      </div>
      <div className="brand-footer">AULAS QUE TRANSFORMAM <span>·</span> MORPH.PT</div>
    </AbsoluteFill>
  );
};
