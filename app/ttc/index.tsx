//@ts-nocheck
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Sleep from "./sleep";
import { format, add } from "date-fns";
import uuid from "react-native-uuid";
import Loader from "./loader";
import TTCAlert from "../../components/ttc-alerts";
import axios from "axios";
import { Button } from "./ui/button";
import ModifyStops from "../../components/modify-button";
import { useFetchTtcData } from "~/lib/fetch-datas";

type frequentBus = {
  routeTitle: string;
  predication: { time: string; branch: string }[];
};

export default function TTC() {
  const [time, setTime] = useState<Date>(new Date());
  const { news, busTimings } = useFetchTtcData();
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!(news || busTimings))
    return (
      <View className="h-full ">
        <ActivityIndicator size="large" className="relative top-1/4" />
      </View>
    );

  return (
    <ScrollView
      className="h-full"
      contentContainerStyle={{
        paddingBottom: 70,
        paddingHorizontal: 15,
        marginTop: 40,
      }}
    >
      <View className="flex flex-col ">
        <View>
          <View className="flex flex-col mt-4 gap-y-2">
            <Text className="text-4xl font-bold  text-foreground">
              Current Time is {format(time, "hh:mm aa")}
            </Text>
          </View>

          <View>
            {busTimings?.length > 0 && (
              <View className="flex flex-col items-end">
                <Text className="text-3xl font-semibold text-center mt-3 pt-3 self-center text-foreground">
                  Frequently used
                </Text>
                <ModifyStops />
              </View>
            )}
            <View className="flex flex-row gap-x-2 flex-wrap">
              {busTimings &&
                busTimings.length > 0 &&
                busTimings.map((bus, index) => {
                  return (
                    <View key={bus.routeTitle + index}>
                      <Text className="text-xl font-semibold pb-1 text-foreground">
                        {bus.routeTitle}
                      </Text>
                      {bus.prediction.map((item, i) => (
                        <Text
                          className="text-lg  font-medium text-foreground"
                          key={i}
                        >
                          {`${format(
                            add(time, { seconds: Number(item.time) }),
                            "hh:mm aa"
                          )}(${item.branch})`}
                        </Text>
                      ))}
                    </View>
                  );
                })}
            </View>
          </View>
          <TTCAlert news={news}></TTCAlert>
        </View>
      </View>
    </ScrollView>
  );
}
