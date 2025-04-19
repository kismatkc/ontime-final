import { Pressable, View } from "react-native";
import { MoonStar } from "~/lib/icons/MoonStar";
import { Sun } from "~/lib/icons/Sun";
import { useColorScheme } from "~/lib/useColorScheme";

export function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();

  function toggleColorScheme() {
    const newTheme = isDarkColorScheme ? "light" : "dark";
    setColorScheme(newTheme);
  }

  return (
    <Pressable onPress={toggleColorScheme}>
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.7 : 1 }}>
          {isDarkColorScheme ? (
            <MoonStar size={25} strokeWidth={1.25} />
          ) : (
            <Sun size={25} strokeWidth={1.25} />
          )}
        </View>
      )}
    </Pressable>
  );
}
