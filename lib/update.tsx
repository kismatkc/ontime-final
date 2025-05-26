import * as Updates from "expo-updates";
import {
  Pressable,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Download } from "lucide-react-native";

import { useEffect, useRef, useState } from "react";
import { Easing } from "react-native-reanimated";

async function applyUpdate() {
  try {
    if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") return;

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync(); // This will reload the app with the new update
  } catch (error) {
    console.log("Error applying update:", error);
    // Handle update error (maybe show an alert to the user)
  }
}

const checkForUpdate = async (setUpdateAvailable: (val: boolean) => void) => {
  try {
    if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") return;
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      setUpdateAvailable(update.isAvailable);
    }
  } catch (e) {
    console.error(e);
  }
};

const DownloadUpdate = ({}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const scale = useRef(new Animated.Value(0.7)).current;
  const DownloadButtonIcon = Animated.createAnimatedComponent(TouchableOpacity);
  const updateCheckIntervalRef = useRef(null);

  useEffect(() => {}, [updateAvailable]);

  useEffect(() => {
    // Initial check for update
    checkForUpdate(setUpdateAvailable);

    // Set up interval to check for updates every minute (60000 ms)
    //@ts-ignore
    updateCheckIntervalRef.current = setInterval(() => {
      checkForUpdate(setUpdateAvailable);
    }, 60000);

    // Clean up interval on component unmount
    return () => {
      if (updateCheckIntervalRef.current) {
        clearInterval(updateCheckIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(scale, {
        toValue: 1,
        duration: 600,
        // easing: Easing.inOut(Easing.quad),
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.7,
        duration: 600,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]);
    const loop = Animated.loop(pulse);
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    updateAvailable && (
      <DownloadButtonIcon
        onPress={() => {
          setUpdateAvailable(false);
          applyUpdate();
        }}
        className="flex flex-row items-center p-2 gap-x-1 rounded-md mb-3 bg-green-500  "
        style={{
          transform: [
            {
              scale: scale.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
          ],
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Download size={20} color={"white"} />
        <Text>UPDATE</Text>
      </DownloadButtonIcon>
    )
  );
};

export default DownloadUpdate;
