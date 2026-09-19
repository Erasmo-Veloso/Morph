# Morph

> **A aula programa o smartphone.**

O Morph é uma experiência educativa criada para o **Hacktudo 2026 — edição
especial de 10 anos**. Participámos como a equipa **Brain Rot** e, entre mais
de **100 ideias**, o Morph foi seleccionado para o **Top 10**.

## Participação e apresentação

- [Ver a apresentação no Canva](https://www.canva.com/d/I1SR-m7R8qDsyW6)
- [Abrir o pitch em PDF](docs/morph-pitch-hacktudo-2026.pdf)
- [Aceder aos materiais do grupo no Google Drive](https://drive.google.com/file/d/1WXUrTaYbTaJ482UDF2IITSdtxaptpNpj/view?usp=drive_link)

## O problema

Durante uma aula, o mesmo smartphone oferece materiais de estudo, calculadora,
navegador, redes sociais, jogos e vídeos — todos ao mesmo tempo. Proibir o
telefone retira também as ferramentas úteis; deixá-lo completamente aberto faz
com que tudo dispute a atenção do aluno.

## Como o Morph resolve

Em vez de tratar o telemóvel como uma distracção a bloquear, o Morph transforma
o plano do professor numa **Learning Capsule**: um plano temporário da aula com
fases, recursos e capacidades pedagógicas. À medida que a aula avança, o
Android disponibiliza as ferramentas que fazem sentido naquele momento.

| Fase da aula | Exemplo de capacidade disponível |
| --- | --- |
| Compreender | Material e explicação guiada |
| Medir | Cronómetro, calculadora e notas |
| Analisar | Dados recolhidos, gráfico e navegador |
| Reflectir | Conclusão individual da aula |

O professor inicia e termina a sessão; fora dela, o telefone volta ao uso
normal. A Capsule já recebida continua a funcionar sem Internet, enquanto os
eventos técnicos ficam guardados localmente para sincronizar depois. O Sentinel
regista a integridade da sessão — por exemplo, uma tentativa de abrir uma
aplicação fora da fase — sem ler mensagens, fotografias ou conversas pessoais.

## Demonstração técnica

Executable Learning Capsule for HACKTUDO 2026: the teacher compiles a lesson
in the Next.js dashboard and the Android runtime changes capabilities as the
lesson advances.

The vertical slice is intentionally narrow: teacher start → Android
`UNDERSTAND` → restricted-package shield → teacher next → Android `MEASURE` →
real accelerometer graph → end-session cleanup.

## Teacher dashboard

```bash
cd web
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Android realtime bridge

```bash
npm install
npm run validate
npm start
```

Open `http://localhost:8787` for the teacher controls.

The local control server persists its current teacher phase in the ignored
`.morph-session-state.json` file so a realtime reconnect does not reset the
active Capsule.

## Android

```bash
scripts/android-build.sh
scripts/android-install.sh
scripts/android-demo-check.sh
```

For a physical device, set `MORPH_SERVER_URL` to the laptop LAN address before
the build. The default URL targets an Android emulator.

`android/local.properties` is machine-local and points to the configured SDK.

## Repository layout

- `contracts/`: versioned TypeScript contract and parser.
- `fixtures/`: deterministic physics Capsule used when compiler/backend is not
  available.
- `web/`: canonical teacher dashboard and pedagogical compiler.
- `server/` + `public/`: Android realtime bridge and diagnostic control.
- `android/`: Kotlin/Compose runtime, Room queue, sensor and Accessibility
  Shield.
- `docs/`: product, architecture, demo procedure and implementation status.

Android SDK and Gradle are configured and the debug APK builds successfully.
The Android vertical slice is verified on the `morph-api36` emulator; physical
handset movement and release signing remain pending. See
`docs/implementation-status.md`.
