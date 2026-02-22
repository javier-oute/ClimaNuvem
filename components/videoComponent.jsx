import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect } from "react";
import { View } from "react-native";
import "../global.css";

const videoNubes = require("@/assets/images/videoNubes.mp4");

export default function DemoVideo() {
  const player = useVideoPlayer(videoNubes, (p) => {
    p.loop = true;
    p.muted = true; // recomendable para backgrounds (y evita problemas de autoplay)
  });

  useEffect(() => {
    player.play();

    return () => {
      player.pause(); // al desmontar
    };
  }, [player]);

  return (
    <View className="absolute inset-0">
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        pointerEvents="none"
      />
    </View>
  );
}

/*
import { useVideoPlayer, VideoView } from "expo-video";
import { View } from "react-native";
import "../global.css";

const videoNubes = require("@/assets/images/videoNubes.mp4");

export default function DemoVideo() {
  const player = useVideoPlayer(videoNubes, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <View className="w-full h-full absolute inset-0 ">
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        pointerEvents="none"
      />
    </View>
  );
}
*/
