import { Text } from "@/components/ui/text";
import { xiorInstance } from "@/lib/fetcher";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/input";
import CategoryCard from "@/components/CategoryCard";
import { useDebouncedCallback } from "use-debounce";
import Toast from "react-native-root-toast";
import SearchBar from "@/components/core/commerce/SearchBar";

export default function CategoriesPage() {
  const [query, setQuery] = useState("");
  const fetchCategoriesByKeyword = (q: string) =>
    xiorInstance
      .get(`/categories/search?q=${q}`)
      .then((data) => Promise.resolve(data.data))
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
      .then((data) => Promise.resolve(data.data))
      .catch((error) => Promise.reject(error));
  const categoriesReq = useQuery({
    queryKey: ["categories", categoriesOffset, categoriesLimitBy],
    queryFn: () => fetchCategories(categoriesOffset, categoriesLimitBy),
    placeholderData: keepPreviousData,
  });

  const categoriesLimitByUpdate = useDebouncedCallback(() => {
    if (categoriesReq.data?.meta.total > categoriesLimitBy) {
      setCategoriesLimitBy((prevLimitBy) => prevLimitBy * 2);
    } else
      Toast.show("No more categories", {
        duration: Toast.durations.LONG,
      });
  }, 1000);

  return (
    <SafeAreaView className="flex-1 p-2">
      <SearchBar
        isError={categoriesSearchReq.isError}
        isLoading={categoriesSearchReq.isFetching}
        searchKeyword={query}
        setSearchKeyword={setQuery}
        placeHolder="categories"
      />

      {categoriesReq.isPending ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}

      {categoriesSearchReq.data?.data?.length > 0 ? (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={categoriesSearchReq.isFetching}
              onRefresh={categoriesSearchReq.refetch}
            />
          }
          data={categoriesSearchReq.data.data}
          renderItem={({ item }) => <CategoryCard category={item} />}
          onEndReachedThreshold={0.5}
          onEndReached={categoriesLimitByUpdate}
        />
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={categoriesReq.isFetching}
              onRefresh={categoriesReq.refetch}
            />
          }
          data={categoriesReq.data?.data}
          renderItem={({ item }) => <CategoryCard category={item} />}
          onEndReachedThreshold={0.5}
          onEndReached={categoriesLimitByUpdate}
        />
      )}
    </SafeAreaView>
  );
}
