import { StyleSheet } from "react-native";
import { useEffect } from "react";
import Animated, {
  Easing,
  StyleProps,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export type MovingTextProps = {
  text: string;
  animationThreshold: number;
  style?: StyleProps;
};

export const MovingText = ({
  text,
  animationThreshold,
  style,
}: MovingTextProps) => {
  const translateX = useSharedValue(0);
  const shouldAnimate = text.length >= animationThreshold;

  const textWidth = text.length * 3;

  useEffect(() => {
    if (!shouldAnimate) return;

    translateX.value = withDelay(
      1000,
      withRepeat(
        withTiming(-textWidth, {
          duration: 5000,
          easing: Easing.linear,
        }),
        -1,
        true
      )
    );

    return () => {
      cancelAnimation(translateX);
      translateX.value = 0;
    };
  }, [translateX, text, animationThreshold, shouldAnimate, textWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.Text
      numberOfLines={1}
      style={[
        style,
        animatedStyle,
        shouldAnimate && {
          width: 9999, // preventing the ellipsis from appearing
          paddingLeft: 16, // avoid the initial character being barely visible
        },
      ]}
    >
      {text}
    </Animated.Text>
  );
};

export const colors = {
  text: "#fff",
};

export const fontSize = {
  base: 20,
};

// Shared Default Styles
export const defaultStyles = StyleSheet.create({
  text: {
    fontSize: fontSize.base,
    color: colors.text,
    zIndex: 10,
  },
});

// Component-Specific Styles
const styles = StyleSheet.create({
  trackTitle: {
    ...defaultStyles.text,
    fontSize: 18,
    fontWeight: "600",
    paddingLeft: 10,
  },
});
