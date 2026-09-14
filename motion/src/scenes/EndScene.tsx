import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export const EndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return <AbsoluteFill className="end-scene" style={{ opacity }}><div className="end-rule" /><Img className="end-lockup" src={staticFile("brand/morph-lockup.jpg")} /><h2>Mais foco.<br /><em>Mais dados.</em><br />Mais aprendizagem.</h2><p>O smartphone metamorfoseia-se conforme a aprendizagem.</p><div className="end-tag">AULAS QUE TRANSFORMAM <span>·</span> HACKTUDO 2026</div></AbsoluteFill>;
};
