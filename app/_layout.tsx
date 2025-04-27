import "~/global.css";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { ThemeToggle } from "~/components/ThemeToggle";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";

import TrackPlayer from "react-native-track-player";

import Toast from "react-native-toast-message";
import { Stack, usePathname, useRouter } from "expo-router";
import * as React from "react";
import { Platform } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { ArrowLeft } from "lucide-react-native";

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setAndroidNavigationBar(colorScheme);
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  const handleBackPress = React.useCallback(() => {
    if (pathname !== "/") {
      router.back();
    }
  }, [pathname, router]);

  if (!isColorSchemeLoaded) {
    return null;
  }

  const showBackButton = pathname !== "/";

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1">
          <View className=" mt-3 flex flex-row justify-between items-center px-3 absolute top-0 left-0 right-0 z-10 ">
            <TouchableOpacity
              onPress={handleBackPress}
              style={{
                opacity: showBackButton ? 1 : 0,
                pointerEvents: showBackButton ? "auto" : "none",
              }}
            >
              <ArrowLeft size={25} />
            </TouchableOpacity>
            <View>
              <ThemeToggle />
            </View>
          </View>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
            // initialRouteName="streaks/index"
          />
          <Toast />

          <PortalHost />
        </View>
      </SafeAreaView>
    </ThemeProvider>
  );
}
