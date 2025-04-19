import { format, add } from "date-fns";
import { useEffect, useState } from "react";
import { Text, View, Button } from "react-native";

import { Linking } from "react-native";
import TimePickerComponent from "../../components/time-picker";

const setAlarm = (date: Date) => {
  // Always use 24-hour format, explicitly using digits to avoid localization issues
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const timeString = `${hours}:${minutes}`;

  const shortcutURL = `shortcuts://run-shortcut?name=set-alarm&input=${encodeURIComponent(
    timeString
  )}`;
  console.log(shortcutURL);

  Linking.openURL(shortcutURL).catch((err) =>
    console.error("Error opening shortcut:", err)
  );
};
const deleteAllAlarms = () => {
  const shortcutURL = "shortcuts://run-shortcut?name=delete-alarms";

  Linking.openURL(shortcutURL).catch((err) =>
    console.error("Error opening shortcut:", err)
  );
};
const Sleep = ({}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="flex flex-col px-2 ">
      <View className="flex flex-col mt-10 gap-y-2">
        <Text className="text-4xl font-bold text-foreground">
          Today is {format(time, "MMM, dd yyyy")}
        </Text>
      </View>
      <View className="mt-6 flex-col gap-y-2">
        <View className="flex flex-row gap-x-1 items-center justify-between">
          <Text className="text-2xl font-bold flex-1 text-foreground ">
            Delete all existing alarms:
          </Text>

          <Button
            title="Delete all alarms"
            color="red"
            onPress={() => deleteAllAlarms()}
          />
        </View>
        <Text className="text-3xl font-bold text-center mb-3 text-foreground">
          Ideal section
        </Text>

        <View className="flex flex-row gap-x-1 items-center justify-between">
          <View className="flex flex-row gap-x-1">
            <Text className="text-xl font-bold text-foreground">
              For 8hrs 10mins sleep:
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {format(add(time, { hours: 8, minutes: 10 }), "hh:mm aa")}
            </Text>
          </View>

          <Button
            title="Set alarm"
            color="green"
            onPress={() => setAlarm(add(time, { hours: 8, minutes: 10 }))}
          />
        </View>
        <View className="flex flex-row gap-x-1 items-center justify-between">
          <View className="flex flex-row gap-x-1">
            <Text className="text-xl font-bold text-foreground">
              For 8hrs 13mins sleep:
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {format(add(time, { hours: 8, minutes: 13 }), "hh:mm aa")}
            </Text>
          </View>

          <Button
            title="Set alarm"
            color="green"
            onPress={() => setAlarm(add(time, { hours: 8, minutes: 13 }))}
          />
        </View>
        <View className="flex flex-row gap-x-1 items-center justify-between">
          <View className="flex flex-row gap-x-1">
            <Text className="text-xl font-bold text-foreground">
              For 8hrs 16mins sleep:
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {format(add(time, { hours: 8, minutes: 16 }), "hh:mm aa")}
            </Text>
          </View>

          <Button
            title="Set alarm"
            color="green"
            onPress={() => setAlarm(add(time, { hours: 8, minutes: 16 }))}
          />
        </View>
      </View>
      <TimePickerComponent
        date={time}
        setAlarm={(date) => {
          setAlarm(date);
        }}
      />
    </View>
  );
};

export default Sleep;
