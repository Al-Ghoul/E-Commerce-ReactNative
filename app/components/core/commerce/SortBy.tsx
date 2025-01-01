import { useColorScheme } from "@/lib/useColorScheme";
import { Dispatch, SetStateAction } from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Text } from "@/components/ui/text";
import { useDebouncedCallback } from "use-debounce";

export default function SortBy({
  sortBy,
  setSortBy,
  onSortByChange,
}: {
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
  onSortByChange: () => void;
}) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View className="flex-row mx-4">
      <Text className="text-foreground font-semibold text-xl my-auto">
        Sort By:
      </Text>
      <Picker
        style={{ flex: 1, color: isDarkColorScheme ? "white" : "black" }}
        selectedValue={sortBy}
        onValueChange={useDebouncedCallback((item) => {
          setSortBy(item);
          onSortByChange();
        }, 1000)}
        dropdownIconColor={isDarkColorScheme ? "white" : "black"}
        mode="dialog"
      >
        <Picker.Item label="Name" value="name" />
        <Picker.Item label="Price: High to Low" value="priceHigh" />
        <Picker.Item label="Price: Low to High" value="priceLow" />
      </Picker>
    </View>
  );
}

