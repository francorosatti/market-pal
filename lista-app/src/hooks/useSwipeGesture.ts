import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue, withTiming } from "react-native-reanimated";

const SWIPE_THRESHOLD = 110;
const EXIT_DISTANCE = 600;

export function useSwipeGesture(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  enabled: boolean
) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const reset = () => {
    translateX.value = 0;
    translateY.value = 0;
  };

  const commit = (direction: "left" | "right") => {
    if (direction === "right") onSwipeRight();
    else onSwipeLeft();
    reset();
  };

  const triggerSwipe = (direction: "left" | "right") => {
    "worklet";
    translateX.value = withTiming(
      direction === "right" ? EXIT_DISTANCE : -EXIT_DISTANCE,
      { duration: 220 },
      () => runOnJS(commit)(direction)
    );
  };

  const pan = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        triggerSwipe("right");
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        triggerSwipe("left");
      } else {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });

  return { pan, translateX, translateY, triggerSwipe: (d: "left" | "right") => triggerSwipe(d) };
}
