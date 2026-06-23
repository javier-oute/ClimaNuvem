import {
  createBottomSheetScrollableComponent,
  SCROLLABLE_TYPE,
} from "@gorhom/bottom-sheet";
import { memo } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Reanimated from "react-native-reanimated";

// Fusiona el `KeyboardAwareScrollView` de react-native-keyboard-controller (auto-scroll del input
// enfocado por encima del teclado) con el sistema scrollable interno de gorhom: así el BottomSheet
// lo sigue reconociendo como su scroll (gestos de arrastre, snap points) y, a la vez, keyboard-controller
// mantiene el campo visible. Replica el patrón con el que gorhom construye su propio BottomSheetScrollView
// (ver node_modules/@gorhom/bottom-sheet/src/components/bottomSheetScrollable/BottomSheetScrollView.tsx).
//
// Se usa SOLO en Android (donde gorhom no hace auto-scroll al input y el campo queda tras el teclado).
// En iOS se sigue usando el BottomSheetScrollView normal, que ya funciona bien.
const AnimatedKAScrollView = Reanimated.createAnimatedComponent(
  KeyboardAwareScrollView,
);

const BottomSheetKeyboardAwareScrollViewComponent =
  createBottomSheetScrollableComponent(
    SCROLLABLE_TYPE.SCROLLVIEW,
    AnimatedKAScrollView,
  );

export const BottomSheetKeyboardAwareScrollView = memo(
  BottomSheetKeyboardAwareScrollViewComponent,
);
BottomSheetKeyboardAwareScrollView.displayName =
  "BottomSheetKeyboardAwareScrollView";
