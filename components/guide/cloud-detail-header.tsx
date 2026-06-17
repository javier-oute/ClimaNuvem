import { Image } from "expo-image";
import { useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export const HEADER_HEIGHT = 460;

type Props = {
  images: number[];
  // Offset de scroll vertical del ScrollView padre (useScrollOffset).
  scrollOffset: SharedValue<number>;
};

// Cabecera con efecto stretchy/parallax y carrusel horizontal a ancho completo.
export default function CloudDetailHeader({ images, scrollOffset }: Props) {
  const { width } = useWindowDimensions();
  const [active, setActive] = useState(0);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActive(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
        ),
      },
      {
        // Al tirar hacia abajo (offset negativo) la imagen se agranda (stretchy).
        scale: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [2, 1, 1],
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
      >
        {images.map((source, i) => (
          <Image
            key={i}
            source={source}
            style={{ width, height: HEADER_HEIGHT }}
            contentFit="cover"
            transition={150}
          />
        ))}
      </ScrollView>

      {/* Indicador de página (dots): el activo más grande y opaco */}
      {images.length > 1 && (
        <View style={styles.dots} pointerEvents="none">
          {images.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === active ? styles.dotActive : null]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
  },
  dots: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#ffffff",
  },
});
