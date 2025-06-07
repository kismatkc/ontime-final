import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
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
import { format, subDays } from "date-fns";
import { Check, ChevronDown, Option } from "lucide-react-native";
import useDecision from "~/components/decision-dialog";

// =============================================
// CONSTANTS
// =============================================
let url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/streaks`;

if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") {
  url = `${process.env.EXPO_PUBLIC_BACKEND_URL}:3000/streaks`;
}

const minDate = "2025-05-10";
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
  guitar: boolean;
  online_income: boolean;
  workout: boolean;
  sleep: boolean;
  basic_hygeine: boolean;
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
  {
    label: "French(Before 8pm + 1.5h min)",
    value: "french",
    conditions: [
      "See the french section first.",
      "Only valid if logged before 8pm.",
      "1.5 hour minimum.",
      "Watch a video in french/Write something in french.",
      "The stopwatch should be a complete 1.5 hours.",
    ],
  },
  {
    label: "TMAD(Max 2)",
    value: "tmad",
    conditions: [
      "Dont eat more than 40gm nuts.",
      "Avoid naan sometimes its not that exquisite.",
      "TMAD=Exact 2 meals a day even a naan/chocolate/anything makes it 3.",
      "Eat with spoon if time.",
      "Allocate 40 mins for eating.",
    ],
  },
  {
    label: "Chewing/Mewing",
    value: "chewing_mewing",
    conditions: [
      "Chew equally on all sides no gap.",
      "Hard mew every 30 minutes.",
    ],
  },
  {
    label: "Guitar(Max 2 hours)",
    value: "guitar",
    conditions: [
      "Do drills before starting.",
      "if night time/early morning play electric guitar else acoustic",
      "If solos requiring bending then play electric guitar.",
      "The session should be max 2 hours.Track using stopwatch.",
    ],
  },
  {
    label: "Online Income/job apply",
    value: "online_income/job",
    conditions: ["Apply for job.", "Try a method to earn money."],
  },

  {
    label: "Workout(30mins intense not just spending time)",
    value: "workout",
    conditions: ["30 mins minium spend set timer."],
  },
  {
    label: "Basic hygeine",
    value: "basic_hygeine",
    conditions: [
      "Twice a day brush teeth",
      "Wash face once must",
      "Tret/nicainamide/anti-aging/hydrating creams",
      "Style/moisturize hair",
    ],
  },
  {
    label: "Sleep(Before 2am + 8h15m)",
    value: "sleep",
    conditions: [
      "Log last sleep",
      "Sleep before 2am(No naps at all).",
      "Total of 8h15m.15m to fall asleep",
      "Regardless of Weekend/weekdays follow same time/patterns",
      "No laying in bed unless sleeping.",
    ],
  },
  {
    label: "Allocate Sleep 8h15m + Workout 30m a day before",
    value: "ideal_sleep",
    conditions: [
      "Make a predication",
      "Be honest with this one",
      "this will improve your life",
    ],
  },
  {
    label: "Hydration",
    value: "hydration",
    conditions: [
      "1 full water bottle after wakeup.",
      "1 full water bottle take to bed.",
      "Every 30 mins take a gulp.",
    ],
  },
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
 * Check if an activity is logged for yesterday
 */
function isActivityLoggedYesterday(
  successDates: string[],
  failureDates: string[]
): boolean {
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const mergedArray = [...successDates, ...failureDates];
  return mergedArray.includes(yesterday);
}

/**
 * Get user logged status for a specific activity
 */
async function getUserLoggedStatus(
  activity: string,
  setAlreadyLogged: (state: boolean) => void,
  setYesterdayLogged: (state: boolean) => void,
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

    // Check if already logged yesterday
    if (isActivityLoggedYesterday(successDates, failureDates)) {
      setYesterdayLogged(true);
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
  const [yesterdayLogged, setYesterdayLogged] = useState(false);
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
      setYesterdayLogged,
      setLoggedStateFetching,
      setMarkedDates,
      setMonthlyStats,
      setStreaks,
      setimportantDates
    );

    return () => {
      setAlreadyLogged(false);
      setYesterdayLogged(false);
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

  const { DecisionDialog, getDecision } = useDecision({
    dialogTitle: "Log Today",
    yesButtonText: "Success",
    noButtonText: "Failure",
  });

  // Function to handle logging with date parameter
  const handleLog = async (isToday: boolean) => {
    try {
      const dateToLog = isToday
        ? format(new Date(), "yyyy-MM-dd")
        : format(subDays(new Date(), 1), "yyyy-MM-dd");

      if (!dateToLog || !selectedStreak) return;

      const decision = await getDecision();

      if (decision) {
        await axios.post(url, {
          event: "addSuccessfulDate",
          date: dateToLog,
          activity: selectedStreak?.value,
        });
      } else {
        await axios.post(url, {
          event: "addFailureDate",
          date: dateToLog,
          activity: selectedStreak?.value,
        });
      }

      setMonthlyStats((prev) => {
        if (!prev) return;
        return {
          ...prev,
          success: decision ? prev.success + 1 : prev.success,
          undoable: decision ? prev.undoable : prev.undoable + 1,
        };
      });

      // Update the habit status
      setAllHabitsLogsStatus((prev: HabitStatusMap | undefined) => {
        if (!prev) return;
        // Only update today's status in the habit tracker if logging today
        if (isToday) {
          return { ...prev, [selectedStreak.value]: true };
        }
        return prev;
      });

      // Update the calendar
      setMarkedDates((prev: any) => ({
        ...prev,
        [dateToLog]: {
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

      // Update the logged status
      if (isToday) {
        setAlreadyLogged(true);
      } else {
        setYesterdayLogged(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView className="flex flex-1 border-4 bg-[#1F1F1f] flex-col pt-12 px-4 ">
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
          <View className="flex flex-row justify-between items-center gap-x-2">
            <SelectTrigger className="relative shrink">
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
              (alreadyLogged && yesterdayLogged ? (
                <View className="flex flex-row items-center gap-x-1">
                  <Text className="text-xl text-white font-bold">
                    All Logged
                  </Text>
                  <Check color={"green"} strokeWidth={3} />
                </View>
              ) : (
                <Select
                  onValueChange={(val) => {
                    if (val?.value === "today") {
                      handleLog(true);
                    } else if (val?.value === "yesterday") {
                      handleLog(false);
                    }
                  }}
                >
                  <SelectTrigger className="rounded-md bg-green-500 px-4 py-2">
                    <View className="flex flex-row items-center gap-x-1">
                      <Text className="text-white text-xl font-bold">Log</Text>
                      <ChevronDown
                        size={16}
                        aria-hidden={true}
                        className="text-white"
                      />
                    </View>
                  </SelectTrigger>
                  <SelectContent className="w-[200px] -mt-16 max-h-100">
                    <SelectGroup>
                      <SelectLabel>Log Options</SelectLabel>
                      {!alreadyLogged && (
                        <SelectItem label="Log Today" value="today" />
                      )}
                      {!yesterdayLogged && (
                        <SelectItem label="Log Yesterday" value="yesterday" />
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
      <View className="flex justify-between w-full flex-row mt-4  items-center ">
        {monthlyStats && (
          <View className="flex flex-col  gap-y-1  mt-2 ">
            <Text className="text-xl font-bold text-white">{`Stats of ${monthlyStats.monthName}`}</Text>
            <Text className="text-green-500 font-semibold text-base">
              {`SUCCESS: ${monthlyStats.success} / ${monthlyStats.totalDays}`}
            </Text>
            <Text className="text-purple-500 font-semibold text-base">
              {`UNDOABLE: ${monthlyStats.undoable} / ${monthlyStats.totalDays}`}
            </Text>
          </View>
        )}
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
      <View className="mt-6 mb-2 shrink">
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
      <View className="flex flex-col justify-between mt-2 gap-y-3">
        {selectedStreak?.conditions && (
          <Text className="text-2xl font-bold text-white">Conditions</Text>
        )}
        {selectedStreak?.conditions &&
          selectedStreak.conditions.map((item, i) => {
            return (
              <View className="flex flex-row items-start gap-x-1" key={i}>
                <Text className=" font-bold text-white">{i + 1}.</Text>
                <Text className="text-white font-bold ">{item}</Text>
              </View>
            );
          })}
      </View>

      <DecisionDialog />
    </ScrollView>
  );
};

export default Streaks;
