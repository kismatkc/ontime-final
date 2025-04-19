import React, { useState } from "react";
import { View, Button, Platform, Text } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

const TimePickerComponent = ({
  date,
  setAlarm,
}: {
  date: Date;
  setAlarm: (date: Date) => void;
}) => {
  const onChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    const currentDate = selectedDate || date;

    if (currentDate) setTime(currentDate);
  };
  const [time, setTime] = useState<Date>(date);

  return (
    <View className="flex flex-col ">
      <Text className="text-3xl font-bold text-center my-3"> Custom Time</Text>
      <View className="flex flex-row items-center  w-full justify-between">
        <View className="flex flex-row items-center">
          <Text className="text-2xl font-semibold text-foreground">
            Select desired Time:
          </Text>
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={onChange}
          />
        </View>
        <Button
          title="Set alarm"
          color="green"
          onPress={() => setAlarm(time)}
        />
      </View>
    </View>
  );
};

export default TimePickerComponent;
