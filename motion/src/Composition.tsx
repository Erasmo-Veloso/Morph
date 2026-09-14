import { AbsoluteFill, Composition, Folder } from "remotion";
import { AndroidMorphSplashVideo } from "./AndroidMorphSplashVideo";
import { MorphTransformationVideo } from "./MorphTransformationVideo";

export const MyComposition = () => {
  return (
    <Folder name="Morph">
      <Composition id="MorphTransformation" component={MorphTransformationVideo} durationInFrames={330} fps={30} width={1920} height={1080} />
      <Composition id="MorphAndroidSplash" component={AndroidMorphSplashVideo} durationInFrames={180} fps={30} width={1920} height={1080} />
    </Folder>
  );
};

export const Empty = () => <AbsoluteFill />;
