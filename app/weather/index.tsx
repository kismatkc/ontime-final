import { ActivityIndicator, Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { format, parseISO } from "date-fns";
import { useFetchTtcData } from "~/lib/fetch-datas";
const NAV_THEME = {
  light: {
    background: "hsl(0 0% 100%)", // background
    border: "hsl(240 5.9% 90%)", // border
    card: "hsl(0 0% 100%)", // card
    notification: "hsl(0 84.2% 60.2%)", // destructive
    primary: "hsl(240 5.9% 10%)", // primary
    text: "hsl(240 10% 3.9%)", // foreground
  },
  dark: {
    background: "hsl(240 10% 3.9%)", // background
    border: "hsl(240 3.7% 15.9%)", // border
    card: "hsl(240 10% 3.9%)", // card
    notification: "hsl(0 72% 51%)", // destructive
    primary: "hsl(0 0% 98%)", // primary
    text: "hsl(0 0% 98%)", // foreground
  },
};

export const gradients: gradientsType = {
  morning: ["#FFB88C", "#FFDDE1"],
  afternoon: ["#6ED4FF", "#3A7BD5"],
  evening: ["#FF6B6B", "#4B6CB7"],
  night: ["#0F2027", "#2C5364"],
};

interface gradientsType {
  morning: string[];
  afternoon: string[];
  evening: string[];
  night: string[];
}

// Function to determine the time of day based on timestamp
const getTimeOfDay = (timestamp: string) => {
  const date = parseISO(timestamp);
  const hours = date.getHours();

  if (hours >= 6 && hours < 12) {
    return "morning";
  } else if (hours >= 12 && hours < 17) {
    return "afternoon";
  } else if (hours >= 17 && hours < 20) {
    return "evening";
  } else {
    return "night";
  }
};

const Weather = () => {
  const { weather } = useFetchTtcData();

  if (!weather)
    return (
      <View className="h-full ">
        <ActivityIndicator size="large" className="relative top-1/4" />
      </View>
    );

  // Get time of day based on the first weather data point
  const timeOfDay = getTimeOfDay(weather.data.WeatherData[0].timestamp);

  return (
    <View className="h-full ">
      <LinearGradient
        style={{ height: "100%", paddingHorizontal: 15, borderRadius: 10 }}
        colors={
          //@ts-ignore
          gradients[timeOfDay] as unknown as readonly [
            string,
            string,
            ...string[]
          ]
        }
      >
        <View className="flex flex-col mt-2 ">
          <Text className="text-6xl text-gray-200 text-center mb-4">
            {weather.data.address}
          </Text>
          {weather.data.WeatherData &&
            weather.data.WeatherData.map((item, index) => (
              <View className="flex flex-col mt-4" key={index}>
                <View className="flex flex-col items-center">
                  <Text className="text-4xl text-gray-200 mb-3">
                    {index === 0
                      ? "Current"
                      : `Around ${format(new Date(item.timestamp), "h aa")}`}
                  </Text>

                  <Text className="text-7xl text-gray-200">
                    {item.temperature}
                  </Text>
                </View>

                <View className="flex flex-row items-center justify-between ">
                  <Text className="text-3xl text-gray-200">
                    {item.description}
                  </Text>
                  <View className="flex flex-row items-center  ">
                    <Text className="text-gray-200 text-3xl">Feels like: </Text>
                    <Text className="text-gray-200 text-6xl">
                      {item.feels_like}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

          <View className="flex flex-col gap-y-1 py-2">
            <Text className="text-4xl text-gray-200 ">
              Sunrise at:{" "}
              {weather.data.WeatherData[0].sunrise &&
                format(
                  new Date(weather.data.WeatherData[0].sunrise * 1000),
                  "hh:mm aa"
                )}
            </Text>
            <Text className="text-4xl text-gray-200 ">
              Sunset at:{" "}
              {weather.data.WeatherData[0].sunset &&
                format(
                  new Date(weather.data.WeatherData[0].sunset * 1000),
                  "hh:mm aa"
                )}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default Weather;
