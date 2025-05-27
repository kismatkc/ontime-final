import axios from "axios";
import { use, useEffect, useState } from "react";
import * as Location from "expo-location";
import { Asset } from "expo-asset";
import { set } from "date-fns";

interface weatherType {
  timestamp: string;
  temperature: string;
  feels_like: string;

  description: string;
  icon: string; // Added icon URL field
  sunrise?: number; // Added optional sunrise field
  sunset?: number; // Added optional sunset field
}

let url = process.env.EXPO_PUBLIC_BACKEND_URL;

if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") {
  url = `${process.env.EXPO_PUBLIC_BACKEND_URL}:3000`;
}

async function getAlerts(setNews: (data: any) => void) {
  try {
    let scrapingUrl = "";

    if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") {
      scrapingUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}:3001/scrape-news`;
    } else {
      scrapingUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/scraper/scrape-news`;
    }
    console.log(scrapingUrl);

    const response = await axios.get(scrapingUrl);
    // const response = await axios.get(`${url}/scrape-news`);

    // Process the data to format numbers at the beginning of paragraphs
    const processedData = response.data.data.map((item: string) => {
      // Check if the text starts with a number
      const matches = item.match(/^(\d+)(.*)$/);
      if (matches) {
        // If it starts with a number, wrap the number in parentheses and add a space
        return `(${matches[1]}) ${matches[2]}`;
      }
      return item;
    });

    setNews(processedData);
    return processedData;
  } catch (error) {
    console.log(error);
  }
}

async function fetchBusTimes(
  setBusTimings: (data: any) => void,
  setStops: (data: any) => void
) {
  try {
    const response = await axios.get(`${url}/bus-times`);

    setBusTimings(response.data.data.times);

    setStops(response.data.data.stops.toString());

    return response.data.data;
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
  }
}

async function fetchWeather(setWeather: (data: any) => void) {
  try {
    // Request location permissions
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (!(status === "granted")) return;

    // Get current location
    let { coords } = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = coords;

    const response = await axios.post(`${url}/weather`, {
      lat: latitude,
      long: longitude,
    });

    setWeather(response.data);

    return response.data;
  } catch (error) {
    console.log(error);
  }
}
type frequentBus = {
  routeTitle: string;
  predication: { time: string; branch: string }[];
};
export const useFetchTtcData = () => {
  const [busTimings, setBusTimings] = useState<frequentBus[] | null>(null);
  const [news, setNews] = useState<string[] | null>(null);
  const [stops, setStops] = useState<string>("");
  const [weather, setWeather] = useState<{
    data: { WeatherData: weatherType[]; address: string };
  } | null>(null);

  const refreshBusTimes = async () =>
    await fetchBusTimes(setBusTimings, setStops);

  useEffect(() => {
    getAlerts(setNews);

    const timer = setInterval(() => {
      getAlerts(setNews);
    }, 50000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchWeather(setWeather);

    const timer = setInterval(() => {
      fetchWeather(setWeather);
    }, 300000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchBusTimes(setBusTimings, setStops);

    const timer = setInterval(() => {
      fetchBusTimes(setBusTimings, setStops);
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      await Asset.fromModule(require("../assets/ttcMap.png")).downloadAsync();
    })();
  }, []);

  return { news, busTimings, stops, refreshBusTimes, weather };
};
