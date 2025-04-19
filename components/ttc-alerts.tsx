import { Text, View } from "react-native";

const TTCAlert = ({ news }: { news: string[] }) => {
  return (
    <View className=" mt-4 px-2 h-full">
      {news && (
        <Text className="text-2xl font-semibold text-center mb-3  text-foreground">
          TTC alerts
        </Text>
      )}
      <View className="flex flex-col gap-y-2">
        {news &&
          news?.length > 0 &&
          news.map((item, i) => (
            <Text key={i} className="text-xl font-semibold text-foreground">
              {`${item}`}
            </Text>
          ))}
      </View>
    </View>
  );
};

export default TTCAlert;
