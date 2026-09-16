import assert from "node:assert/strict";

const baseUrl = process.env.MORPH_WEB_URL ?? "http://127.0.0.1:3001";
const fixtures = [
  ["Física", "Movimento Acelerado", "Criar uma aula sobre movimento acelerado com experiência prática, recolha de dados, análise de velocidade e reflexão."],
  ["História", "Revolução Industrial", "Criar uma aula sobre a Revolução Industrial com fontes históricas, comparação de condições de trabalho, análise de evidências e reflexão."],
  ["Inglês", "Pronúncia e expressão oral", "Criar uma aula de Inglês sobre pronúncia e expressão oral com escuta, prática de fala, autoanálise e reflexão."],
  ["Artes", "Composição visual", "Criar uma aula de Artes sobre composição visual com observação de referências, criação, análise da composição e reflexão."]
];

const responses = [];
const interRequestDelayMs = 20_000;
for (const [index, [subject, label, intent]] of fixtures.entries()) {
  const response = await fetch(`${baseUrl}/api/compile`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ intent })
  });
  const payload = await response.json();
  assert.equal(response.status, 200, `${label}: compile failed`);
  assert.equal(payload.source, "groq", `${label}: provider fallback used`);
  assert.equal(payload.capsule.phases.length, 4, `${label}: capsule phase count`);
  assert.deepEqual(payload.capsule.phases.map(({ id }) => id), ["UNDERSTAND", "MEASURE", "ANALYSE", "REFLECT"]);
  assert.ok(payload.draft.phases.every(({ recommended_apps }) => Array.isArray(recommended_apps)));
  assert.ok(payload.capsule.phases.every(({ allowed_apps }) => allowed_apps.length === 0), `${label}: app selected without teacher review`);
  responses.push({ subject, label, title: payload.draft.title, recommendations: payload.draft.phases.map(({ id, recommended_apps }) => ({ id, apps: recommended_apps.map(({ id: appId }) => appId) })) });
  if (index < fixtures.length - 1) await new Promise((resolve) => setTimeout(resolve, interRequestDelayMs));
}

console.log(JSON.stringify({ provider: "groq", capsules: responses }, null, 2));
