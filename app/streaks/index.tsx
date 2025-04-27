import { useEffect, useState } from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
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
import { Check, ChevronDown, Option } from "lucide-react-native";
import useDecision from "~/components/decision-dialog";

// =============================================
// CONSTANTS
// =============================================
const url = "https://puppeter-kismat-kcs-projects.vercel.app/streaks";
// const url =
//   process.env.EXPO_PUBLIC_ENVIRONMENT === "development"
//     ? "http://localhost:4000/streaks"
//     : "https://puppeter-kismat-kcs-projects.vercel.app/streaks";
const minDate = "2025-04-24";
const totalDays = new Date(2025).getDate();
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// =============================================
// TYPES
// =============================================
type OptionExtended =
  | {
      value: string;
      label: string;
      conditions?: Array<string>;
    }
  | undefined;

type HabitStatusMap = {
  french: boolean;
  tmad: boolean;
  chew_mew: boolean;
  spoon: boolean;
  guitar: boolean;
  online_income: boolean;
  french_immersion: boolean;
  workout: boolean;
  sleep: boolean;
};

type stats = {
  success: number;
  undoable: number;
  monthName: string;
  totalDays: number;
};

// =============================================
// DATA
// =============================================
const streakItems: OptionExtended[] = [
  { label: "1 Hour Minimum French", value: "french" },
  { label: "Strict TMAD", value: "tmad" },
  {
    label: "Chewing/Mewing",
    value: "chewing_mewing",
    conditions: [
      "Chew equally on all sides in one go.",
      "Hard mew every 30 minutes.",
    ],
  },
  { label: "Eat with Spoon", value: "eat_with_spoon" },
  { label: "Guitar Practice", value: "guitar" },
  { label: "Online Income", value: "online_income" },
  {
    label: "French Immersion",
    value: "french_immersion",
    conditions: ["Watch a video in french"],
  },
  { label: "Workout", value: "workout" },
  { label: "8 Hours Sleep", value: "sleep" },
  {
    label: "Hydration",
    value: "hydration",
    conditions: [
      "1 full water bottle after wakeup.",
      "1 full water bottle take to bed.",
    ],
  },
  { label: "French Mock Test", value: "french_mock_test" },
];

// Default styling for various calendar date types
const CALENDAR_STYLES = {
  default: {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      color: "#ef4444",
    },
  },
  success: {
    container: {
      borderWidth: 2,
      borderColor: "#22c55e",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      color: "white",
    },
  },
  failure: {
    container: {
      borderWidth: 2,
      borderColor: "#a855f7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      color: "white",
    },
  },
};

// =============================================
// API FUNCTIONS
// =============================================

/**
 * Fetch successful dates for an activity
 */
async function fetchSuccessfulDates(activity: string) {
  const response = await axios.post(url, {
    event: "getSuccessfulDates",
    activity,
  });
  return response.data.data;
}

/**
 * Fetch failure dates for an activity
 */
async function fetchFailureDates(activity: string) {
  const response = await axios.post(url, {
    event: "getFailureDates",
    activity,
  });
  return response.data.data;
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Gets the logged status for all habits
 */
async function getAllHabitsLoggedStatus(): Promise<HabitStatusMap> {
  const habitsStatus = streakItems.reduce((acc: any, item) => {
    if (!item) return acc;
    acc[item.value] = false;
    return acc;
  }, {});

  try {
    // Initialize result object with default values

    // Get today's date
    const today = format(new Date(), "yyyy-MM-dd");

    // Process each habit separately
    for (const item of streakItems) {
      if (!item) continue;
      const habitName = item.value;

      // Get successful and failure dates for this specific habit
      const successDates = await fetchSuccessfulDates(habitName);
      const failureDates = await fetchFailureDates(habitName);

      // Merge the arrays
      const mergedArray = [...successDates, ...failureDates];

      // Check if today's date exists in the merged array
      if (mergedArray.includes(today)) {
        //@ts-ignore
        habitsStatus[habitName] = true;
      }
    }

    return habitsStatus;
  } catch (error) {
    console.error("Error fetching habit statuses:", error);

    // Return default object with all habits set to false in case of error
    return habitsStatus;
  }
}

/**
 * Calculate streak from array of dates
 */
function calculateStreak(dates: string[], currentDate = new Date()) {
  // Handle empty data
  if (!dates || dates.length === 0) {
    return 0;
  }

  // Convert string dates to Date objects and sort them
  const datesToCheck = dates
    .map((dateStr) => new Date(dateStr))
    .sort((a: any, b: any) => a - b);

  // Create a Set for O(1) lookups
  const dateSet = new Set(dates);

  let streak = 0;

  // Start from yesterday and count backwards
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);

  let checkDate = yesterday;

  while (true) {
    // Format the date to YYYY-MM-DD for lookup
    const dateString = checkDate.toISOString().split("T")[0];

    // If the date exists in our set, increment streak
    if (dateSet.has(dateString)) {
      streak++;
      // Move to the previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Streak is broken
      break;
    }
  }

  return streak;
}

/**
 * Get monthly statistics
 */
function getMonthlyStatistics(
  successDates: string[],
  failureDates: string[],
  month: number,
  year: number
): stats {
  // Calculate total days in specified month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Get month name
  const monthName = MONTH_NAMES[month];

  // Filter success dates to only include specified month and year
  const filteredSuccessDates = successDates.filter((dateStr) => {
    const date = new Date(dateStr);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  // Filter failure dates to only include specified month and year
  const filteredFailureDates = failureDates.filter((dateStr) => {
    const date = new Date(dateStr);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  // Count success and failures for specified month
  const successCount = filteredSuccessDates.length;
  const undoableCount = filteredFailureDates.length;

  return {
    success: successCount,
    undoable: undoableCount,
    monthName: monthName,
    totalDays: totalDays,
  };
}

/**
 * Create marked dates object for calendar
 */
function createMarkedDatesObject(
  successDates: string[],
  failureDates: string[]
) {
  const markedDates: any = {};

  const today = new Date();

  // Loop through each day from minDate to today
  for (
    let date = new Date(minDate);
    date <= today;
    date.setDate(date.getDate() + 1)
  ) {
    const dateString = format(date, "yyyy-MM-dd");

    if (date <= new Date(minDate)) continue;
    markedDates[dateString] = {
      customStyles: CALENDAR_STYLES.default,
    };
  }

  // Process success dates (green border) - these will override the default styling
  successDates.forEach((date: string) => {
    markedDates[date] = {
      customStyles: CALENDAR_STYLES.success,
    };
  });

  // Process failure dates (purple border) - these will override both default and success styling
  failureDates.forEach((date: string) => {
    markedDates[date] = {
      customStyles: CALENDAR_STYLES.failure,
    };
  });

  // console.log(JSON.stringify(markedDates, null, 2));

  return markedDates;
}

/**
 * Check if an activity is logged for today
 */
function isActivityLoggedToday(
  successDates: string[],
  failureDates: string[]
): boolean {
  const today = format(new Date(), "yyyy-MM-dd");
  const mergedArray = [...successDates, ...failureDates];
  return mergedArray.includes(today);
}

/**
 * Get user logged status for a specific activity
 */
async function getUserLoggedStatus(
  activity: string,
  setAlreadyLogged: (state: boolean) => void,
  setLoggedStateFetching: (state: boolean) => void,
  setMarkedDates: (state: any) => void,
  setMonthlyStats: (val: stats) => void,
  setStreak: (str: any) => void,
  setimportantDates: (val: {
    successDates: string[];
    failureDates: string[];
  }) => void
) {
  try {
    // Fetch the data from API
    const successDates = await fetchSuccessfulDates(activity);
    const failureDates = await fetchFailureDates(activity);

    // Prepare the important dates response
    const importantDatesResponse = {
      successDates: successDates,
      failureDates: failureDates,
    };

    // Set important dates
    if (importantDatesResponse) {
      setimportantDates(importantDatesResponse);
    }

    // Create and set marked dates for calendar
    const markedDateResponse = createMarkedDatesObject(
      successDates,
      failureDates
    );
    setMarkedDates(markedDateResponse || {});

    // Set monthly statistics
    setMonthlyStats(
      getMonthlyStatistics(
        successDates,
        failureDates,
        new Date().getMonth(),
        new Date().getFullYear()
      )
    );

    // Set streak count
    setStreak(calculateStreak(successDates));

    // Check if already logged today
    if (isActivityLoggedToday(successDates, failureDates)) {
      setAlreadyLogged(true);
    }

    // Update loading state
    setLoggedStateFetching(false);
  } catch (error) {
    console.log(error);
    // Ensure we reset loading state even on error
    setLoggedStateFetching(false);
  }
}

const Streaks = () => {
  const [selectedStreak, setSelectedStreak] = useState<null | OptionExtended>(
    null
  );

  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [loggedStateFetching, setLoggedStateFetching] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState<stats>();
  const [streaks, setStreaks] = useState<number>(0);
  const [remainingToBeLOgged, setRemainingToBeLOgged] = useState<number>();
  const [importantDates, setimportantDates] = useState<null | {
    successDates: string[];
    failureDates: string[];
  }>(null);

  const [markedDates, setMarkedDates] = useState({});
  const [allHabitsLogsStatus, setAllHabitsLogsStatus] =
    useState<HabitStatusMap>();

  useEffect(() => {
    (async () => {
      const allHabitsStatus = await getAllHabitsLoggedStatus();

      setAllHabitsLogsStatus(allHabitsStatus);
    })();
    if (!selectedStreak) return;

    getUserLoggedStatus(
      selectedStreak.value,
      setAlreadyLogged,
      setLoggedStateFetching,
      setMarkedDates,
      setMonthlyStats,
      setStreaks,
      setimportantDates
    );

    return () => {
      setAlreadyLogged(false);
      setLoggedStateFetching(true);
    };
  }, [selectedStreak]);

  useEffect(() => {
    if (!allHabitsLogsStatus) return;

    const remaining = Object.values(allHabitsLogsStatus).filter(
      (item) => !item
    ).length;

    setRemainingToBeLOgged(remaining);
  }, [allHabitsLogsStatus]);

  const { DecisionDialog, getDecision } = useDecision();

  return (
    <View className="flex flex-1 border-4 bg-[#1F1F1f] flex-col pt-12 px-4">
      <View>
        <Select
          onValueChange={async (val) => {
            if (!val?.value) return;
            const value = streakItems.find(
              (item) => item?.value === val?.value
            );
            setSelectedStreak(value);
          }}
        >
          <View className="flex flex-row justify-between items-center">
            <SelectTrigger className=" relative">
              <View className="flex flex-row items-center gap-x-1 mr-3">
                <SelectValue
                  className="text-foreground text-sm native:text-lg"
                  placeholder="Select a habit"
                />
                <ChevronDown
                  size={16}
                  aria-hidden={true}
                  className="text-foreground opacity-50"
                />
              </View>
              {remainingToBeLOgged && remainingToBeLOgged > 0 ? (
                <View className="absolute -top-1 right-0.5">
                  <Text className="text-red-500 text-xl z-50 font-bold">
                    {remainingToBeLOgged}
                  </Text>
                </View>
              ) : null}
            </SelectTrigger>
            {selectedStreak &&
              !loggedStateFetching &&
              (alreadyLogged ? (
                <View className="flex flex-row items-center gap-x-1">
                  <Text className="text-xl text-white font-bold">Logged</Text>
                  <Check color={"green"} strokeWidth={3} />
                </View>
              ) : (
                <TouchableOpacity
                  className=" rounded-md bg-green-500 "
                  onPress={async () => {
                    try {
                      const today = format(new Date(), "yyyy-MM-dd");
                      if (!today || !selectedStreak) return;
                      const decision = await getDecision();
                      if (decision) {
                        const response = await axios.post(url, {
                          event: "addSuccessfulDate",
                          date: today,
                          activity: selectedStreak?.value,
                        });
                      } else {
                        const response = await axios.post(url, {
                          event: "addFailureDate",
                          date: today,
                          activity: selectedStreak?.value,
                        });
                      }
                      setMonthlyStats((prev) => {
                        if (!prev) return;
                        return {
                          ...prev,
                          success: decision ? prev.success + 1 : prev.success,
                          undoable: decision
                            ? prev.undoable
                            : prev.undoable + 1,
                        };
                      });

                      setAllHabitsLogsStatus(
                        (prev: HabitStatusMap | undefined) => {
                          if (!prev) return;
                          return { ...prev, [selectedStreak.value]: true };
                        }
                      );

                      setMarkedDates((prev: any) => ({
                        ...prev,
                        [today]: {
                          customStyles: {
                            container: {
                              borderWidth: 2,
                              borderColor: decision ? "#22c55e" : "#a855f7",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            },
                            text: {
                              color: "white",
                            },
                          },
                        },
                      }));

                      setAlreadyLogged(true);
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                >
                  <Text className="text-white text-xl font-bold px-4 py-2">
                    Log today
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
          <SelectContent className="w-[200px] -mt-16  max-h-100 ">
            <SelectGroup>
              <SelectLabel>Habits</SelectLabel>
              {streakItems.map(
                (item, i) =>
                  item && (
                    <View
                      key={i}
                      className="flex flex-row items-center gap-x-2"
                    >
                      <SelectItem
                        label={`${item.label} `}
                        value={item.value}
                        key={item.value}
                      />
                      {allHabitsLogsStatus &&
                        //@ts-ignore
                        !allHabitsLogsStatus[item.value] && (
                          <Text className="text-red-500 -ml-5 font-bold text-xl">
                            {"\u002A"}
                          </Text>
                        )}
                    </View>
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
          {selectedStreak && (
            <View className="flex flex-col items-center">
              <Text className="text-white text-5xl font-bold">{streaks}</Text>
              <Text className="text-[#aaaf8d] text-2xl font-bold">{`DAY${
                streaks >= 2 ? "s" : ""
              }`}</Text>
            </View>
          )}
        </View>
      </View>
      <View className="mt-6 flex-shrink mb-2">
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
          hideExtraDays
          minDate={minDate}
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
          markedDates={markedDates}
          onMonthChange={(chnage: any) => {
            const { year, month } = chnage;
            if (!importantDates) return;
            setMonthlyStats(
              getMonthlyStatistics(
                importantDates.successDates,
                importantDates.failureDates,
                month - 1,
                year
              )
            );
          }}
        />
      </View>
      <View className="flex flex-row justify-between mt-2">
        <View className="flex flex-col items-start gap-y-1 ">
          {selectedStreak?.conditions && (
            <Text className="text-xl font-bold text-white">Conditions</Text>
          )}
          {selectedStreak?.conditions &&
            selectedStreak.conditions.map((item, i) => {
              return (
                <View className="flex flex-row items-start gap-x-1" key={i}>
                  <Text className=" font-bold text-white">{i + 1}.</Text>
                  <Text className="text-white font-bold">{item}</Text>
                </View>
              );
            })}
        </View>

        <View>
          {monthlyStats && (
            <View className="flex flex-col items-end gap-y-1 grow mt-2">
              <Text className="text-xl font-bold text-white">{`Stats of ${monthlyStats.monthName}`}</Text>
              <Text className="text-green-500 font-semibold text-base">
                {` SUCCESS: ${monthlyStats.success} / ${monthlyStats.totalDays}`}
              </Text>
              <Text className="text-purple-500 font-semibold text-base">
                {` UNDOABLE: ${monthlyStats.undoable} / ${monthlyStats.totalDays}`}
              </Text>
            </View>
          )}
        </View>
      </View>

      <DecisionDialog />
    </View>
  );
};

export default Streaks;
