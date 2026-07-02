import {
  createBottomSheetScrollableComponent,
  SCROLLABLE_TYPE,
} from "@gorhom/bottom-sheet";
import { memo } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Reanimated from "react-native-reanimated";

// Fusiona el KeyboardAwareScrollView de keyboard-controller con el scrollable de gorhom; solo en Android (en iOS ya funciona).
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
