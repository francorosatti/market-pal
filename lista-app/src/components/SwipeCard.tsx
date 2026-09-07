import { forwardRef, useImperativeHandle } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from "react-native-reanimated";
import { Category, Product } from "../data/types";
import { useSwipeGesture } from "../hooks/useSwipeGesture";
import { AWNING_DARK, BRICK, INK, MUTED, SAGE } from "../theme/colors";

export type SwipeCardHandle = {
  triggerSwipe: (direction: "left" | "right") => void;
};

type Props = {
  category: Pick<Category, "emoji" | "color" | "name">;
  item: Product;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard(
  { category, item, onSwipeLeft, onSwipeRight },
  ref
) {
  const { pan, translateX, translateY, triggerSwipe } = useSwipeGesture(
    onSwipeLeft,
    onSwipeRight,
    true
  );

  useImperativeHandle(ref, () => ({ triggerSwipe }));

  const cardStyle = useAnimatedStyle(() => {
    const rotate = translateX.value / 18;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const stampYesStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [40, 110], [0, 1], Extrapolation.CLAMP),
  }));
  const stampNoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-110, -40], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, { borderColor: category.color }, cardStyle]}>
        <Text style={styles.emojiWatermark}>{category.emoji}</Text>
        <Text style={styles.categoryLabel}>{category.name}</Text>
        <Text style={styles.name}>{item.name}</Text>
        {item.freq > 0 && (
          <Text style={styles.freq}>
            Comprado {item.freq} {item.freq === 1 ? "vez" : "veces"} antes
          </Text>
        )}
        <Animated.View style={[styles.stamp, styles.stampYes, stampYesStyle]}>
          <Text style={[styles.stampText, { color: SAGE, borderColor: SAGE }]}>LO LLEVO</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampNo, stampNoStyle]}>
          <Text style={[styles.stampText, { color: BRICK, borderColor: BRICK }]}>PASO</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 320,
    height: 380,
    backgroundColor: "#FAF8F0",
    borderWidth: 3,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    shadowColor: AWNING_DARK,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  emojiWatermark: { position: "absolute", top: 18, fontSize: 34, opacity: 0.35 },
  categoryLabel: { fontSize: 12, letterSpacing: 0.5, color: MUTED, marginTop: 46 },
  name: { fontSize: 38, lineHeight: 42, marginTop: 10, color: INK, fontWeight: "700", textAlign: "center" },
  freq: { fontSize: 13, color: MUTED, marginTop: 14 },
  stamp: {
    position: "absolute",
    top: 30,
  },
  stampYes: { left: 22 },
  stampNo: { right: 22 },
  stampText: {
    fontSize: 24,
    letterSpacing: 2,
    fontWeight: "700",
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderWidth: 3,
    borderRadius: 8,
  },
});
