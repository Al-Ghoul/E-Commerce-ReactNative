import { Text } from "@/components/ui/text";
import { xiorInstance } from "@/lib/fetcher";
import Icon from "@/lib/icons/Icon";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "lucide-react-native";
import { useColorScheme } from "@/lib/useColorScheme";
import { Link } from "expo-router";
import { Input } from "@/components/ui/input";

export default function CategoriesPage() {
  const { isDarkColorScheme } = useColorScheme();
  const [query, setQuery] = useState("");
  const fetchCategoriesByKeyword = (q: string) =>
    xiorInstance
      .get(`/categories/search?q=${q}`)
      .then((data) => Promise.resolve(data))
      .catch((error) => Promise.reject(error));
  const categoriesSearchReq = useQuery({
    queryKey: ["categories", query],
    queryFn: () => fetchCategoriesByKeyword(query),
    enabled: query.length > 0,
  });
  const categoriesOffset = 0;
  const [categoriesLimitBy, setCategoriesLimitBy] = useState(8);
  const fetchCategories = (offset: number, limitBy: number) =>
    xiorInstance
      .get(`/categories?limit=${limitBy}&offset=${offset}`)
      .then((data) => Promise.resolve(data))
      .catch((error) => Promise.reject(error));
  const categoriesReq = useQuery({
    queryKey: ["categories", categoriesOffset, categoriesLimitBy],
    queryFn: () => fetchCategories(categoriesOffset, categoriesLimitBy),
    placeholderData: keepPreviousData,
  });

  return (
    <SafeAreaView className="flex-1 p-2">
      <View className="mx-2 mb-4">
        <Input
          placeholder="Search categories..."
          value={query}
          onChangeText={setQuery}
        />

        {categoriesSearchReq.isError ? (
          <Text className="text-red-500">Something went wrong</Text>
        ) : null}
        {categoriesSearchReq.isFetching ? (
          <View className="absolute top-3 right-3 mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
        ) : null}
      </View>

      {categoriesReq.isPending ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}

      {categoriesSearchReq.data?.data.data.length > 0 ? (
        <ScrollView className="mx-2">
          {categoriesSearchReq.data?.data.data.map((category: Category) => (
            <Link
              key={category.id}
              href={{
                pathname: "/(app)/categories/[id]/products",
                params: { id: category.id, categoryName: category.name },
              }}
              className="max-h-28 mb-3 text-background rounded-sm border-2 border-border px-2.5 py-0.5"
            >
              <View className="h-full w-full items-center p-2">
                <Icon
                  name={category.icon as keyof typeof icons}
                  color={isDarkColorScheme ? "white" : "black"}
                  size={40}
                />

                <Text className="text-foreground my-auto">
                  {category.name}
                </Text>

                <Text>{category.description}</Text>
              </View>
            </Link>
          ))}
        </ScrollView>
      ) : (
        categoriesReq.data?.data.data.length > 1 && (
          <ScrollView
            className="mx-2"
            onMomentumScrollEnd={() => {
              if (categoriesReq.data?.data.meta.total > categoriesLimitBy)
                setCategoriesLimitBy((prevLimitBy) => prevLimitBy * 2);
            }}
          >
            {categoriesReq.data?.data.data.map((category: Category) => (
              <Link
                key={category.id}
                href={{
                  pathname: "/(app)/categories/[id]/products",
                  params: { id: category.id, categoryName: category.name },
                }}
                className="w-full mb-3 text-background rounded-sm border-2 max-h-28 border-border px-2.5 py-0.5"
              >
                <View className="h-full w-full items-center p-2">
                  <Icon
                    name={category.icon as keyof typeof icons}
                    color={isDarkColorScheme ? "white" : "black"}
                    size={40}
                  />

                  <Text className="text-foreground my-auto">
                    {category.name}
                  </Text>

                  <Text>{category.description}</Text>
                </View>
              </Link>
            ))}
          </ScrollView>
        )
      )}
    </SafeAreaView>
  );
}
