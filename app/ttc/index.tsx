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
import ImagePopupComponent from "~/components/ttc-image";

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
      <View className="flex-1 flex-col ">
        <View className=" mt-20 self-end mr-2">
          <ImagePopupComponent />
        </View>
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
          <View>
            {busTimings?.length > 0 && (
              <View className="flex flex-col items-end gap-x-4">
                <Text className="text-3xl font-semibold text-center mt-3 pt-3 self-center text-foreground">
                  Frequently used
                </Text>
                <ModifyStops />
                <View className="mt-2">
                  <ImagePopupComponent />
                </View>
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
