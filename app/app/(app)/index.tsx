import { xiorInstance } from "@/lib/fetcher";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
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

export default function IndexPage() {
  const { session } = useSession();
  const { isDarkColorScheme } = useColorScheme();

  const categoriesOffset = 0;
  const [categoriesLimitBy, setCategoriesLimitBy] = useState(8);
  const fetchCategories = (offset: number, limitBy: number) =>
    xiorInstance
      .get(`/categories/?limit=${limitBy}&offset=${offset}`)
      .then((data) => Promise.resolve(data))
      .catch((error) => Promise.reject(error));
  const categoriesReq = useQuery({
    queryKey: ["categories", categoriesOffset, categoriesLimitBy],
    queryFn: () => fetchCategories(categoriesOffset, categoriesLimitBy),
    placeholderData: keepPreviousData,
  });

  const [productsKeyword, setProductsKeyword] = useState("");
  const fetchCategoriesByKeyword = (q: string) =>
    xiorInstance
      .get(`/products/search?q=${q}`)
      .then((data) => Promise.resolve(data))
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
      .then((data) => Promise.resolve(data))
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

  const categoriesLimitByUpdate = useDebouncedCallback(() => {
    if (categoriesReq.data?.data.meta.total > categoriesLimitBy) {
      setCategoriesLimitBy((prevLimitBy) => prevLimitBy * 2);
    } else
      Toast.show("No more categories", {
        duration: Toast.durations.LONG,
      });
  }, 1000);

  const productsLimitByUpdate = useDebouncedCallback(() => {
    if (productsReq.data?.data.meta.total > productsLimitBy) {
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
      {categoriesReq.isPending ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}
      
      {categoriesReq.data?.data.data.length > 1 && (
        <ScrollView
          horizontal
          className="mx-2 py-5"
          onMomentumScrollEnd={categoriesLimitByUpdate}
          showsHorizontalScrollIndicator={false}
        >
          <Pressable
            className={
              (selectedCategory === -1 ? "bg-foreground" : "bg-background") +
              " text-background items-center rounded-full self-center border border-border h-8 ml-2 px-2.5 py-0.5"
            }
            onPress={() => setSelectedCategory(-1)}
          >
            <Text
              className={
                selectedCategory === -1 ? "text-background" : "text-foreground"
              }
            >
              All
            </Text>
          </Pressable>

          {categoriesReq.data?.data.data.map((category: Category) => (
            <Pressable
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              className={
                (selectedCategory === category.id
                  ? "bg-foreground"
                  : "bg-background") +
                " text-background items-center rounded-full self-center border border-border h-8 ml-2 px-2.5 py-0.5"
              }
            >
              <Text
                className={
                  selectedCategory === category.id
                    ? "text-background"
                    : "text-foreground"
                }
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <View className="flex-row mx-4">
        <Text className="text-foreground font-semibold text-xl my-auto">
          Sort By:
        </Text>
        <Picker
          style={{ flex: 1, color: isDarkColorScheme ? "white" : "black" }}
          selectedValue={sortBy}
          onValueChange={useDebouncedCallback((item) => {
            setSortBy(item);
            setProductsLimitBy(8);
          }, 1000)}
          dropdownIconColor={isDarkColorScheme ? "white" : "black"}
          mode="dialog"
        >
          <Picker.Item label="Name" value="name" />
          <Picker.Item label="Price: High to Low" value="priceHigh" />
          <Picker.Item label="Price: Low to High" value="priceLow" />
        </Picker>
      </View>
      <View className="mb-4 mx-2">
        <Input
          placeholder="Search products..."
          value={productsKeyword}
          onChangeText={setProductsKeyword}
        />

        {productsSearchReq.isError ? (
          <Text className="text-red-500">Something went wrong</Text>
        ) : null}
        {productsSearchReq.isFetching ? (
          <View className="absolute top-3 right-3 mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
        ) : null}
      </View>

      {productsReq.isPending ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}

      {productsSearchReq.data?.data.data.length > 0 ? (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={productsSearchReq.isFetching}
              onRefresh={productsSearchReq.refetch}
            />
          }
          onEndReachedThreshold={0.5}
          onEndReached={productsLimitByUpdate}
          data={productsSearchReq.data?.data.data}
          renderItem={({ item }) => (
            <ProductCard product={item} createCartItemReq={createCartItemReq} />
          )}
          className="mx-2"
        />
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={productsReq.isFetching}
              onRefresh={productsReq.refetch}
            />
          }
          onEndReachedThreshold={0.5}
          onEndReached={productsLimitByUpdate}
          data={productsReq.data?.data.data}
          renderItem={({ item }) => (
            <ProductCard product={item} createCartItemReq={createCartItemReq} />
          )}
          className="mx-2"
        />
      )}
    </SafeAreaView>
  );
}
