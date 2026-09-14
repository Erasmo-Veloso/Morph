# Morph transformation video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Micro-demo audiovisual do Morph: o mesmo smartphone passa de `COMPREENDER` para `SHIELD` e `MEDIR`, usando os ecrãs Android reais do vertical slice.

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

Abre `http://localhost:3010/MorphTransformation` depois de iniciar o Studio.

**Render video**

```console
npx remotion render MorphTransformation artifacts/morph-transformation.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p
```

O MP4 renderizado fica em `artifacts/morph-transformation.mp4` e a cópia usada pelo Teacher Studio em `../web/public/media/morph-transformation.mp4`.

Os dois splashs finais são renderizados com copy determinística:

```console
npx remotion still MorphSplashPortalFinal artifacts/morph-splash-portal-final.png
npx remotion still MorphSplashProofFinal artifacts/morph-splash-proof-final.png
```

`PortalFinal` é a abertura; `ProofFinal` é a transição tecnológica Shield → acelerómetro.

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
