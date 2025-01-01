import { xiorInstance } from "@/lib/fetcher";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useState } from "react";
import { RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "@/lib/useColorScheme";
import { useDebouncedCallback } from "use-debounce";
import Toast from "react-native-root-toast";
import { CartItemInputSchemaType } from "@/lib/zodTypes";
import { useSession } from "@/components/AuthContext";
import { FlatList } from "react-native-gesture-handler";
import ProductCard from "@/components/ProductCard";
import Categories from "@/components/core/commerce/Categories";

export default function IndexPage() {
  const { session } = useSession();

  const [productsKeyword, setProductsKeyword] = useState("");
  const fetchCategoriesByKeyword = (q: string) =>
    xiorInstance
      .get(`/products/search?q=${q}`)
      .then((res) => Promise.resolve(res.data))
      .catch((error) => Promise.reject(error));
  const productsSearchReq = useQuery({
    queryKey: ["products", productsKeyword],
    queryFn: () => fetchCategoriesByKeyword(productsKeyword),
    enabled: productsKeyword.length > 0,
  });

  const productsOffset = 0;
  const [sortBy, setSortBy] = useState("name");
  const [productsLimitBy, setProductsLimitBy] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState(-1);

  const fetchProducts = (
    offset: number,
    category_id: number,
    sortBy: string,
    limitBy: number,
  ) =>
    xiorInstance
      .get(
        `/products?limit=${limitBy}&offset=${offset}&category=${category_id}&sortBy=${sortBy === "priceHigh" ? "price" : sortBy === "priceLow" ? "price" : sortBy}&orderBy=${sortBy === "priceHigh" ? "desc" : sortBy === "priceLow" ? "asc" : "asc"}`,
      )
      .then((res) => Promise.resolve(res.data))
      .catch((error) => Promise.reject(error));
  const productsReq = useQuery({
    queryKey: [
      "categories",
      productsOffset,
      selectedCategory,
      sortBy,
      productsLimitBy,
    ],
    queryFn: () =>
      fetchProducts(productsOffset, selectedCategory, sortBy, productsLimitBy),
    placeholderData: keepPreviousData,
  });

  const productsLimitByUpdate = useDebouncedCallback(() => {
    if (productsReq.data?.meta.total > productsLimitBy) {
      setProductsLimitBy((prevLimitBy) => prevLimitBy * 2);
    } else
      Toast.show("No more products", {
        duration: Toast.durations.LONG,
      });
  }, 1000);

  const cartReq = useQuery({
    queryKey: ["userCart", session?.userId],
    queryFn: () => xiorInstance.get(`/users/${session?.userId}/carts`),
    enabled: !!session?.userId,
  });

  const createCartItemReq = useMutation({
    mutationKey: ["userCart", cartReq.data?.data.data.id],
    mutationFn: (ItemData: CartItemInputSchemaType) =>
      xiorInstance.post(`/carts/${cartReq.data?.data.data.id}/items`, ItemData),
  });

  return (
    <SafeAreaView>
      <Categories
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onCategoryPress={() => setProductsKeyword("")}
      />

      <ProductsFilter
        filterBy={sortBy}
        setFilterBy={setSortBy}
        onFilterByChange={() => setProductsLimitBy(8)}
      />

      <ProductsSearch
        productsKeyword={productsKeyword}
        setProductsKeyword={setProductsKeyword}
        isLoading={productsSearchReq.isFetching}
        isError={productsSearchReq.isError}
      />

      {productsReq.isPending ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}

      {productsSearchReq.data?.data?.length > 0 ? (
        <>
          <Text className="text-center">Search Results:</Text>
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={productsSearchReq.isFetching}
                onRefresh={productsSearchReq.refetch}
              />
            }
            onEndReachedThreshold={0.5}
            onEndReached={productsLimitByUpdate}
            data={productsSearchReq.data?.data}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                createCartItemReq={createCartItemReq}
              />
            )}
            className="mx-2"
          />
        </>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={productsReq.isFetching}
              onRefresh={productsReq.refetch}
            />
          }
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          onEndReached={productsLimitByUpdate}
          data={productsReq.data?.data}
          renderItem={({ item }) => (
            <ProductCard product={item} createCartItemReq={createCartItemReq} />
          )}
          className="mx-2"
        />
      )}
    </SafeAreaView>
  );
}

function ProductsFilter({
  filterBy,
  setFilterBy,
  onFilterByChange,
}: {
  filterBy: string;
  setFilterBy: Dispatch<SetStateAction<string>>;
  onFilterByChange: () => void;
}) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View className="flex-row mx-4">
      <Text className="text-foreground font-semibold text-xl my-auto">
        Sort By:
      </Text>
      <Picker
        style={{ flex: 1, color: isDarkColorScheme ? "white" : "black" }}
        selectedValue={filterBy}
        onValueChange={useDebouncedCallback((item) => {
          setFilterBy(item);
          onFilterByChange();
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

function ProductsSearch({
  isError,
  isLoading,
  productsKeyword,
  setProductsKeyword,
}: {
  isError: boolean;
  isLoading: boolean;
  productsKeyword: string;
  setProductsKeyword: Dispatch<SetStateAction<string>>;
}) {
  return (
    <View className="mb-4 mx-2">
      <Input
        placeholder="Search products..."
        value={productsKeyword}
        onChangeText={setProductsKeyword}
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
