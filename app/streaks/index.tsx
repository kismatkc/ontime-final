import { Option } from "@rn-primitives/select";
import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import { format } from "date-fns";
import { Check } from "lucide-react-native";

const streakItems: Option[] = [
  { label: "French", value: "french" },
  { label: "Spoon", value: "spoon" },
  { label: "Guitar", value: "guitar" },
  { label: "Online income", value: "online_income" },
];

async function getUserLoggedStatus(
  activity: string,
  setAlreadyLogged: (state: boolean) => void,
  setLoggedStateFetching: (state: boolean) => void
) {
  try {
    const successObject = await axios.post("http://localhost:4000/streaks", {
      event: "getSuccessfulDates",
      activity,
    });
    const failuresObject = await axios.post("http://localhost:4000/streaks", {
      event: "getFailureDates",
      activity,
    });

    const today = format(new Date(), "yyyy-MM-dd");
    const mergedArray = [
      ...successObject.data.data,
      ...failuresObject.data.data,
    ];
    if (mergedArray.includes(today)) {
      setAlreadyLogged(true);
    }
    setLoggedStateFetching(false);
  } catch (error) {
    console.log(error);
  }
}

const Streaks = () => {
  const [selectedStreak, setSelectedStreak] = useState<null | Option>(null);
  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [loggedStateFetching, setLoggedStateFetching] = useState(true);

  useEffect(() => {
    if (!selectedStreak) return;
    console.log(selectedStreak.value, setAlreadyLogged, setLoggedStateFetching);

    getUserLoggedStatus(
      selectedStreak.value,
      setAlreadyLogged,
      setLoggedStateFetching
    );
  }, [selectedStreak]);

  return (
    <View className="flex flex-1 border-4 bg-[#1F1F1f] flex-col pt-16 px-4">
      <View>
        <Select
          onValueChange={async (val) => {
            setSelectedStreak(val);
          }}
        >
          <View className="flex flex-row justify-between items-center">
            <SelectTrigger className="w-[140px]">
              <SelectValue
                className="text-foreground text-sm native:text-lg"
                placeholder="Select a habit"
              />
            </SelectTrigger>
            {selectedStreak &&
              !loggedStateFetching &&
              (alreadyLogged ? (
                <View className="flex flex-row items-center gap-x-1">
                  <Text className="text-xl text-white font-bold">Logged</Text>
                  <Check color={"green"} strokeWidth={3} />
                </View>
              ) : (
                <Pressable
                  className=" rounded-md bg-green-500"
                  onPress={async () => {
                    try {
                      const today = format(new Date(), "yyyy-MM-dd");
                      if (!today || !selectedStreak) return;
                      const response = await axios.post(
                        "http://localhost:4000/streaks",
                        {
                          event: "addSuccessfulDate",
                          date: today,
                          activity: selectedStreak?.value,
                        }
                      );
                      setAlreadyLogged(true);
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                >
                  <Text className="text-white text-xl font-bold px-4 py-2">
                    Log today
                  </Text>
                </Pressable>
              ))}
          </View>
          <SelectContent className="w-[180px] -mt-16">
            <SelectGroup>
              <SelectLabel>Habits</SelectLabel>
              {streakItems.map(
                (item) =>
                  item && (
                    <SelectItem
                      label={item.label}
                      value={item.value}
                      key={item.value}
                    >
                      {item.label}
                    </SelectItem>
                  )
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="w-full  flex justify-center flex-row">
        <Text className="text-white text-4xl font-bold mt-6">
          {selectedStreak?.label}
        </Text>
      </View>
      <View className="flex justify-center w-full flex-row mt-2">
        <View className="border-[10px] border-[#FCBB3E] rounded-full w-36 h-36 flex items-center justify-center">
          <View className="flex flex-col items-center">
            <Text className="text-white text-5xl font-bold">5</Text>
            <Text className="text-[#aaaf8d] text-2xl font-bold">DAYS</Text>
          </View>
        </View>
      </View>
      <View className="mt-10">
        <View className="flex flex-row justify-between my-3">
          <View className="flex flex-row gap-x-2 items-center">
            <View className="w-6 h-6 border-green-500 border-2 rounded-full">
              <Text className="opacity-0">Success</Text>
            </View>
            <Text className="text-green-500 font-semibold text-base">
              SUCCESS
            </Text>
          </View>
          <View className="flex flex-row gap-x-2 items-center">
            <View className="w-6 h-6 border-purple-500 border-2 rounded-full">
              <Text className="opacity-0">undoable</Text>
            </View>
            <Text className="text-purple-500 font-semibold text-base">
              UNDOABLE
            </Text>
          </View>
          <View className="flex flex-row gap-x-2 items-center">
            <Text className="text-red-500 font-semibold text-lg">5</Text>
            <Text className="text-red-500 font-semibold text-lg">FAIL</Text>
          </View>
        </View>
        <Calendar
          onDayPress={(day: string) => {
            console.log("selected day", day);
          }}
          hideExtraDays
          minDate="2025-04-17"
          theme={{
            backgroundColor: "#1F1F1f",
            calendarBackground: "#1F1F1f",
            textSectionTitleColor: "#b6c1cd",
            monthTextColor: "white",
            arrowColor: "white",
            dayTextColor: "white",
            textDisabledColor: "grey",
          }}
          markingType={"custom"}
          // markedDates={{
          //   "2025-04-19": {
          //     customStyles: {
          //       container: {
          //         borderWidth: 2,
          //         borderColor: "green",

          //         display: "flex",
          //         alignItems: "center",
          //         justifyContent: "center",
          //       },
          //       text: {
          //         color: "white",
          //       },
          //     },
          //   },
          //   "2025-04-20": {
          //     customStyles: {
          //       container: {
          //         borderWidth: 2,
          //         borderColor: "red",

          //         display: "flex",
          //         alignItems: "center",
          //         justifyContent: "center",
          //       },
          //       text: {
          //         color: "white",
          //       },
          //     },
          //   },
          // }}
        />
      </View>
    </View>
  );
};

export default Streaks;
