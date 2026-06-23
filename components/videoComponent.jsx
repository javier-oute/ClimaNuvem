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
      try {
        player.play();
      } catch {
        // el player puede no estar listo todavía; se ignora
      }
      return () => {
        try {
          player.pause();
        } catch {
          // el player puede no estar listo todavía; se ignora
        }
      };
    }, [player]),
  );

  // Reanudar al volver a "active" (por ejemplo tras bloqueo)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active")
        try {
          player.play();
        } catch {
          // el player puede no estar listo todavía; se ignora
        }
    });
    return () => sub.remove();
  }, [player]);

  return (
    <View className="absolute inset-0" pointerEvents="none">
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        nativeControls={false}
        requiresLinearPlayback
      />
    </View>
  );
}
