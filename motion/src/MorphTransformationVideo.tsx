import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { BrandScene } from "./scenes/BrandScene";
import { EndScene } from "./scenes/EndScene";
import { TransformationScene } from "./scenes/TransformationScene";

export const MorphTransformationVideo: React.FC = () => <TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={74} name="Brand"><BrandScene /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 14 })} />
  <TransitionSeries.Sequence durationInFrames={200} name="Transformation"><TransformationScene /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 14 })} />
  <TransitionSeries.Sequence durationInFrames={70} name="End"><EndScene /></TransitionSeries.Sequence>
</TransitionSeries>;
