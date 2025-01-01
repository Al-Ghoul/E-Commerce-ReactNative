import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction } from "react";
import { View } from "react-native";

export default function SearchBar({
  isError,
  isLoading,
  searchKeyword,
  setSearchKeyword,
  placeHolder,
}: {
  isError: boolean;
  isLoading: boolean;
  searchKeyword: string;
  setSearchKeyword: Dispatch<SetStateAction<string>>;
  placeHolder?: string;
}) {
  return (
    <View className="mb-4 mx-2">
      <Input
        placeholder={`Search ${placeHolder}...`}
        value={searchKeyword}
        onChangeText={setSearchKeyword}
      />

      {isError ? (
        <Text className="text-red-500 text-center">
          Something went wrong while searching
        </Text>
      ) : null}

      {isLoading ? (
        <View className="absolute top-3 right-3 mx-auto w-5 h-5 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}
    </View>
  );
}
