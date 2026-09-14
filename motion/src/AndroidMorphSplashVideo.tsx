import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

type Mode = {
  label: string;
  caption: string;
  color: string;
  path: string;
};

const modes: Mode[] = [
  { label: "COMPREENDER", caption: "aprender", color: "#2875ea", path: "M8 4h8v16H8z M8 7h8 M8 11h6 M8 15h5" },
  { label: "MORPH SHIELD", caption: "proteger o foco", color: "#27b878", path: "M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6z M9 12l2 2 4-4" },
  { label: "MEDIR", caption: "experimentar", color: "#1f6bff", path: "M5 19V11h3v8z M10.5 19V7h3v12z M16 19V3h3v16z" },
];

const clamp = (value: number, input: [number, number], output: [number, number]) => interpolate(value, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const ModeSymbol: React.FC<{ mode: Mode; size: number; opacity: number; scale: number }> = ({ mode, size, opacity, scale }) => (
  <div style={{ width: size, height: size, opacity, scale, display: "grid", placeItems: "center", border: `2px solid ${mode.color}`, borderRadius: "50%", backgroundColor: "#fff", boxShadow: `0 12px 30px ${mode.color}26` }}>
    <svg width={size * .43} height={size * .43} viewBox="0 0 24 24" fill="none" stroke={mode.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={mode.path} />
    </svg>
  </div>
);

const PhoneScreen: React.FC<{ opacity: number; scale: number }> = ({ opacity, scale }) => (
  <div style={{ position: "absolute", left: "50%", top: "50%", width: 300, height: 610, border: "7px solid #122346", borderRadius: 46, backgroundColor: "#fff", boxShadow: "0 28px 58px rgba(16,39,77,.18)", transform: `translate(-50%, -50%) scale(${scale})`, opacity, overflow: "hidden", padding: "24px 26px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", color: "#687b99", fontSize: 13, fontWeight: 700 }}><span>9:41</span><span>5G&nbsp; · &nbsp;▮</span></div>
    <Img src={staticFile("brand/morph-lockup.jpg")} style={{ width: 170, height: 62, objectFit: "contain", objectPosition: "left center", mixBlendMode: "multiply", marginTop: 20 }} />
    <div style={{ color: "#1f6bff", fontSize: 12, fontWeight: 800, letterSpacing: ".18em", marginTop: 26 }}>CAPSULE · 02 / 04</div>
    <div style={{ color: "#14254d", fontSize: 37, fontWeight: 800, letterSpacing: "-.06em", marginTop: 18 }}>Medir</div>
    <div style={{ width: 45, height: 4, backgroundColor: "#1f6bff", marginTop: 16 }} />
    <div style={{ marginTop: 25, borderRadius: 18, backgroundColor: "#eaf3ff", padding: 18 }}>
      <div style={{ color: "#1f6bff", fontSize: 13, fontWeight: 800, letterSpacing: ".1em" }}>ACELERÓMETRO REAL</div>
      <div style={{ color: "#14254d", fontSize: 21, fontWeight: 700, marginTop: 9 }}>Dados do movimento.</div>
      <div style={{ display: "flex", alignItems: "end", gap: 7, height: 92, marginTop: 26, borderBottom: "2px solid #b8d2f5" }}>
        {[.35, .58, .42, .84, .64, .94, .5].map((height, index) => <span key={index} style={{ flex: 1, height: `${height * 100}%`, borderRadius: "5px 5px 0 0", backgroundColor: "#1f6bff" }} />)}
      </div>
      <div style={{ color: "#627493", fontSize: 12, marginTop: 14 }}>Sensores do dispositivo · offline-first</div>
    </div>
    <div style={{ color: "#627493", fontSize: 13, marginTop: 28 }}>O mesmo telefone. Mais possibilidades para aprender.</div>
  </div>
);

export const AndroidMorphSplashVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = clamp(frame, [0, 20], [0, 1]);
  const converge = clamp(frame, [92, 145], [0, 1]);
  const finish = clamp(frame, [145, 178], [0, 1]);
  const phoneOpacity = clamp(frame, [116, 150], [0, 1]);
  const centerOpacity = clamp(frame, [18, 35], [0, 1]) * (1 - finish * .85) * (1 - phoneOpacity);
  const radius = 320 - converge * 220;
  const orbitAngle = frame * .035;

  return (
    <AbsoluteFill style={{ backgroundColor: "#fff", fontFamily: "Arial, Helvetica, sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: .48, backgroundImage: "linear-gradient(rgba(24,57,103,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(24,57,103,.035) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <Img src={staticFile("brand/morph-lockup.jpg")} style={{ position: "absolute", left: 72, top: 62, width: 250, height: 92, objectFit: "contain", objectPosition: "left center", mixBlendMode: "multiply", opacity: intro }} />
      <div style={{ position: "absolute", right: 74, top: 82, color: "#14254d", fontSize: 14, fontWeight: 800, letterSpacing: ".24em", opacity: intro }}>AULA AO VIVO <span style={{ color: "#1f6bff", margin: "0 10px" }}>·</span> ANDROID</div>

      <div style={{ position: "absolute", left: 100, top: 360, width: 550, opacity: intro, transform: `translateX(${(1 - intro) * -32}px)` }}>
        <div style={{ color: "#1f6bff", fontSize: 17, fontWeight: 800, letterSpacing: ".2em" }}>METAMORFOSE EM CURSO <span style={{ display: "inline-block", width: 38, height: 4, marginLeft: 12, verticalAlign: "middle", backgroundColor: "#1f6bff" }} /></div>
        <h1 style={{ color: "#14254d", fontSize: 66, lineHeight: .98, letterSpacing: "-.06em", margin: "28px 0 22px" }}>O mesmo telefone.<br /><span style={{ color: "#1f6bff" }}>Outra função.</span></h1>
        <p style={{ color: "#627493", fontSize: 25, lineHeight: 1.3, margin: 0 }}>Os modos voam à volta da intenção pedagógica. A Capsule escolhe a ferramenta certa para este momento.</p>
      </div>

      <div style={{ position: "absolute", left: 1095, top: 370, width: 640, height: 660 }}>
        {[0, 1, 2].map((index) => {
          const angle = orbitAngle + index * (Math.PI * 2 / 3);
          const isSelected = index === 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const selectedX = x * (1 - converge);
          const selectedY = y * (1 - converge);
          const otherAlpha = 1 - converge * .92;
          return <div key={modes[index].label} style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(calc(-50% + ${selectedX}px), calc(-50% + ${selectedY}px))`, opacity: isSelected ? 1 : otherAlpha, rotate: `${isSelected ? angle * 22 : angle * 12}deg` }}><ModeSymbol mode={modes[index]} size={isSelected ? 118 : 96} opacity={1} scale={isSelected ? 1 + converge * .3 : 1 - converge * .12} /><div style={{ color: modes[index].color, fontSize: 13, fontWeight: 800, letterSpacing: ".12em", textAlign: "center", marginTop: 15, whiteSpace: "nowrap", opacity: isSelected ? 1 : otherAlpha }}>{modes[index].label}</div></div>;
        })}
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 500, height: 500, border: "1px solid #dbe8f8", borderRadius: "50%", transform: "translate(-50%, -50%)", opacity: .8 - converge * .8 }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 360, height: 360, border: "1px solid #dbe8f8", borderRadius: "50%", transform: "translate(-50%, -50%)", opacity: .6 - converge * .6 }} />
        <PhoneScreen opacity={phoneOpacity} scale={.78 + clamp(frame, [132, 168], [0, 1]) * .22} />
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", color: "#14254d", fontSize: 18, fontWeight: 800, letterSpacing: ".16em", opacity: centerOpacity, whiteSpace: "nowrap" }}>A CAPSULE ESCOLHE</div>
      </div>

      <div style={{ position: "absolute", left: 100, right: 100, bottom: 60, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#627493", fontSize: 14, fontWeight: 800, letterSpacing: ".2em", opacity: intro }}><span>AULAS QUE TRANSFORMAM</span><span><b style={{ color: "#1f6bff" }}>03</b> / MEDIR · SENSORES REAIS</span></div>
    </AbsoluteFill>
  );
};
