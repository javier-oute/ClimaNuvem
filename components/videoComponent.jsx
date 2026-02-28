import { useFocusEffect } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect } from "react";
import { AppState, View } from "react-native";
import "../global.css";

const videoNubes = require("@/assets/images/videoNubes.mp4");

export default function DemoVideo() {
  const player = useVideoPlayer(videoNubes, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  // Reproducir cuando la pantalla está enfocada
  useFocusEffect(
    useCallback(() => {
      player.play();
      return () => player.pause();
    }, [player]),
  );

  // Reanudar al volver a "active" (por ejemplo tras bloqueo)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") player.play();
    });
    return () => sub.remove();
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
