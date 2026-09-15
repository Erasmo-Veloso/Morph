const runtimeUrl = process.env.MORPH_RUNTIME_URL ?? "http://127.0.0.1:8787";

const response = await fetch(`${runtimeUrl}/bridge/reset`, { method: "POST" });
const payload = await response.json().catch(() => ({}));
if (!response.ok || payload.enrollment?.state !== "PENDING" || payload.session?.phase !== "FINISHED") {
  throw new Error(payload.error ?? "O runtime não confirmou o reset da demo.");
}

console.log(`Demo reset: ${payload.enrollment.studentName} · ${payload.enrollment.pairingCode} · Capsule pronta`);
