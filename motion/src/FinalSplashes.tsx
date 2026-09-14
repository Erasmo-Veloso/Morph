import { AbsoluteFill, Composition, Img, staticFile } from "remotion";

const textStyle = { fontFamily: "Arial, Helvetica, sans-serif" };

export const PortalFinalSplash: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#fff", ...textStyle }}>
    <Img src={staticFile("splash/portal-progression.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <div style={{ position: "absolute", left: 100, top: 430, width: 700, color: "#10274d", fontSize: 59, lineHeight: .99, letterSpacing: "-.055em", fontWeight: 800 }}>
      O smartphone<br /><span style={{ color: "#2475ea" }}>metamorfoseia-se</span><br />conforme a aprendizagem.
    </div>
    <div style={{ position: "absolute", left: 104, top: 650, color: "#687b99", fontSize: 24, letterSpacing: "-.02em" }}>Uma aula. Diferentes propósitos. O mesmo dispositivo.</div>
    <div style={{ position: "absolute", left: 104, bottom: 58, color: "#1d3761", fontSize: 13, fontWeight: 800, letterSpacing: ".24em" }}>AULAS QUE TRANSFORMAM <span style={{ color: "#2875ea", margin: "0 12px" }}>·</span> HACKTUDO 2026</div>
  </AbsoluteFill>
);

export const ProofFinalSplash: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#fff", ...textStyle }}>
    <Img src={staticFile("splash/proof-transition.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <div style={{ position: "absolute", left: 82, top: 96, width: 520, color: "#10274d", fontSize: 45, lineHeight: 1.02, letterSpacing: "-.05em", fontWeight: 800 }}>
      Na mesma aula,<br />o telefone <span style={{ color: "#2475ea" }}>muda de função.</span>
    </div>
    <div style={{ position: "absolute", left: 86, top: 260, color: "#687b99", fontSize: 20, letterSpacing: "-.01em" }}>Morph Shield → acelerómetro real</div>
    <div style={{ position: "absolute", right: 80, top: 58, color: "#1d3761", fontSize: 13, fontWeight: 800, letterSpacing: ".24em" }}>MORPH <span style={{ color: "#2875ea", margin: "0 12px" }}>·</span> AULA AO VIVO</div>
  </AbsoluteFill>
);

export const FinalSplashCompositions = () => (
  <>
    <Composition id="MorphSplashPortalFinal" component={PortalFinalSplash} durationInFrames={1} fps={30} width={1672} height={940} />
    <Composition id="MorphSplashProofFinal" component={ProofFinalSplash} durationInFrames={1} fps={30} width={1672} height={940} />
  </>
);
